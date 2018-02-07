function MST(spearman, kruskal, chi){
    // default setting of nodes label and paths label
    var on_nodes_label = 1;
    var on_paths_label = 1;

    // min p value for the statistical test
    var min_pvalue = 0.05;

    // to get max or minimum value of effect size
    var max_value = -99999;
    var min_value = 99999;

    // storing links and nodes
    var links = [];
    var nodes = [];

    // filtering test data which > min p value
    // selecting value used for each test
    for(var i = 0; i < spearman.length; i++){
        if(spearman[i].pvalue > min_pvalue){
            continue;
        }
        var obj = {};
        obj.source = spearman[i].x;
        obj.target = spearman[i].y;
        obj.value = Number(spearman[i].rho2);
        if(obj.value > max_value){
            max_value = obj.value;
        }
        if(obj.value < min_value){
            min_value = obj.value;
        }
        links.push(obj);
        var index = nodes.indexOf(spearman[i].x);
        if(index == -1){
            nodes.push(spearman[i].x);
        }
        index = nodes.indexOf(spearman[i].y);
        if(index == -1){
            nodes.push(spearman[i].y);
        }
    }

    for(var i = 0; i < kruskal.length; i++){
        if(kruskal[i].pvalue > min_pvalue){
            continue;
        }
        var obj = {};
        obj.source = kruskal[i].x;
        obj.target = kruskal[i].y;
        obj.value = Number(Number(kruskal[i].chisq)/kruskal[i].n);
        if(obj.value > max_value){
            max_value = obj.value;
        }
        if(obj.value < min_value){
            min_value = obj.value;
        }
        links.push(obj);
        var index = nodes.indexOf(kruskal[i].x);
        if(index == -1){
            nodes.push(kruskal[i].x);
        }
        index = nodes.indexOf(kruskal[i].y);
        if(index == -1){
            nodes.push(kruskal[i].y);
        }
    }

    for(var i = 0; i < chi.length; i++){
        if(chi[i].chisq_pvalue > min_pvalue) {
            continue;
        }
        var obj = {};
        obj.source = chi[i].x;
        obj.target = chi[i].y;
        obj.value = Number(chi[i].cramer_v);
        if(obj.value > max_value){
            max_value = obj.value;
        }
        if(obj.value < min_value){
            min_value = obj.value;
        }
        links.push(obj);
        var index = nodes.indexOf(chi[i].x);
        if(index == -1){
            nodes.push(chi[i].x);
        }
        index = nodes.indexOf(chi[i].y);
        if(index == -1){
            nodes.push(chi[i].y);
        }
    }

    var graph = {};
    graph.nodes = nodes;
    graph.edges = links;

    // get the links to form MST
    links = minimumSpanningTree(graph);

    nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link.source] ||
            (nodes[link.source] = {name: link.source});
        link.target = nodes[link.target] ||
            (nodes[link.target] = {name: link.target});
        link.value = +link.value;
    });

    // Add nodes into the 'select node' menu
    var temp = Object.keys(nodes);
    for(var i = 0; i < temp.length; i++){
        $('#select_nodes').append('<input type="checkbox" name="nodes" value="' + temp[i] + '"><span class="select_nodes_label">'+ temp[i] +'</span><br>');
    }

    // width and height in SVG
    var width  = 1000,
        height = 500;

    // default value where minimum is 50 and maximum is 150
    var factor = d3.scale.linear().domain([min_value, max_value]).range([50,150]);

    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(function(d){
            return factor(d.value);
        })
        .charge(-250)
        .on("tick", tick)
        .start();

    // if range of link charge changes from setting
    d3.select("#link_charge")
        .on("input", charge_inputted);

    // if range of link distance changes from setting
    d3.select("#link_distance")
        .on("input", distance_inputted);

    // Set the range
    var  v = d3.scale.linear().range([0, 1]);

    // Scale the range of the data
    v.domain([0, d3.max(links, function(d) { return d.value; })]);

    var svg = d3.select("#mst-graph").append("svg")
        .attr("width", width)
        .attr("height", height);

    var counter = 0;

    var path = svg.append("svg:g").selectAll("path")
        .data(force.links())
        .enter().append("svg:path")
        .attr('id', function(d){
            // Prevent having same id for same value
            counter++;
            return counter + ',' + d.value;
        })
        .style("stroke-width", 2);

    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    // find the neighbours
    var linkedByIndex = {};
    for (i = 0; i < graph.nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
    };

    graph.edges.forEach(function (d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

    // variable to toggle when user double click on the nodes
    var toggle = 0;

    // tooltip mouseover event handler on path value
    var tipMouseover = function(d) {
        // does not allow mouseover when the label is shown upon clicking
        if(toggle == 1 && on_paths_label == 1){
            return;
        }
        // Add tooltip
        var tooltip = d3.select('body').append("div")
            .attr("class", "tooltip");

        var html  = '<span>value : '+ (d.value).toPrecision(3) +'</span>';

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition()
            .duration(200) // ms
            .style('background-color','#c5fad3')
            .style("opacity", 0.9) // started as 0!

    };

    // tooltip mouseover event handler on nodes
    var nodeMouseover = function(d) {
        // does not allow mouseover when the label is shown upon clicking
        if(toggle == 1 && on_nodes_label == 1){
            return;
        }
        // Add tooltip
        var tooltip = d3.select('body').append("div")
            .attr("class", "tooltip");

        var html  = '<span>'+ d.name +'</span>';

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition()
            .duration(200) // ms
            .style('background-color','lightblue')
            .style("opacity", 0.9) // started as 0!
    };

    // tooltip mouseout event handler
    var tipMouseout = function(d) {
        $('.tooltip').remove();
    };

    // add the nodes
    node.append("circle")
        .attr("r", 5)
        .on('dblclick', connectedNodes)
        .on("mouseover", nodeMouseover)
        .on("mouseout", tipMouseout);

    // add the lines
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y;

            return "M" +
                d.source.x + "," +
                d.source.y + "L" +
                d.target.x + "," +
                d.target.y;
        });

        path.style("stroke", "red")
            .style("stroke-width", '2')
            .on("mouseover", tipMouseover)
            .on("mouseout", tipMouseout);

        var radius = 5;

        node.attr("transform", function(d) {
                d.x = Math.max(radius, Math.min(width - radius, d.x));
                d.y = Math.max(radius, Math.min(height - radius, d.y));
                return "translate(" + d.x + "," + d.y + ")"; });
    }

    // storing nodes which has been highlighted on the checkbox, allow multiple selection
    var highlighted = [];

    // highlight nodes which are checked on checkbox
    $("input[name='nodes']").change(function() {
        if($(this).is(":checked")) {
            highlighted.push($(this).val());
        }else{
            var index = highlighted.indexOf($(this).val());
            if(index != -1){
                highlighted.splice(index,1);
            }
        }
        if(highlighted.length != 0) {
            highlightNode(highlighted);
            toggle = 1;
        }else{
            returnOpacity();
        }
    });

    // toggling function on nodes label
    $('#nodes_label').on('click',function(d){
        if(on_nodes_label == 1) on_nodes_label = 0;
        else{
            on_nodes_label = 1;
        }
        if(toggle == 1){
            highlightNode(highlighted);
        }
    })

    // toggling function on path label
    $('#paths_label').on('click',function(d){
        if(on_paths_label == 1) on_paths_label = 0;
        else{
            on_paths_label = 1;
        }
        if(toggle == 1){
            highlightNode(highlighted);
        }
    })

    // Reset setting function
    $('#mst_setting_reset').on('click',function(){
        $('#nodes_label').prop('checked',true);
        on_nodes_label = 1;
        $('#paths_label').prop('checked',true);
        on_paths_label = 1;
        $('input[type="range"]').val(0.5);
        var factor = d3.scale.linear().domain([min_value, max_value]).range([50,150]);
        var force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(links)
            .size([width, height])
            .linkDistance(function(d){
                return factor(d.value);
            })
            .charge(-250)
            .on("tick", tick)
            .start();
    })

    // highlight nodes according to the array
    function highlightNode(array){
        // dimmed all the nodes and path
        node.style("opacity", 0.05);
        path.style("opacity", 0.05);
        $('.node_text').remove();
        $('textPath').remove();
        // return the circle to original state
        $('.node').each(function (e) {
            d3.select(this).select("circle").transition()
                .duration(750)
                .attr("r", 6)
                .style("fill", "black");
        });
        // highlight the nodes selected and its neighbour
        $('.node').each(function (e) {
            d = d3.select(this).node().__data__;
            if (array.indexOf(d.name) != -1) {
                node.style("opacity", function (o) {
                    if(neighboring(d,o) | neighboring(o,d)){
                        return 1;
                    }else{
                        if($(this).css('opacity') == 1){
                            return 1;
                        }else{
                            return 0.05;
                        }
                    }
                });
                path.style("opacity", function (o) {
                    if(o.source === d || o.target === d){
                        return 1;
                    }else{
                        if($(this).css('opacity') == 1){
                            return 1;
                        }else{
                            return 0.05;
                        }
                    }
                    return o.source === d || o.target === d ? 1 : 0.05;
                });
            }
        });
        // add text to selected nodes and change the selected nodes' circles
        $('.node').each(function (e) {
            if ($(this).css('opacity') == '1') {
                var curr_node = d3.select(this);
                curr_node.append("text")
                    .attr('class', 'node_text')
                    .attr("x", 12)
                    .attr("dy", ".35em")
                    .text(function (e) {
                        if(array.indexOf(e.name) != -1){
                            curr_node.select('circle').transition()
                                .duration(750)
                                .attr("r", 16)
                                .style("fill", function(d){
                                    return 'orange';
                                });
                        }else{
                            curr_node.select('circle').transition()
                                .style("fill", function(d){
                                    return 'orange';
                                });
                        }
                        if(on_nodes_label == 1) {
                            return e.name;
                        }else{
                            return;
                        }
                    });
            }
        })
        // add the text to path with opacity 1
        $('path').each(function (d) {
            if ($(this).css('opacity') == '1') {
                var curr_path = d3.select(this);
                var id = (curr_path.attr('id'));
                var index = id.indexOf(',');
                var value = id.substring(index+1, id.length - 1);
                var thing = svg.append("g")
                    .attr("id", "thing")
                    .style("fill", "navy");
                thing.append("text")
                    .style("font-size", "12px")
                    .attr("dy", -10)
                    .attr("dx", 20)
                    .append("textPath")
                    .attr("xlink:href", function (d) {
                        return '#' + id;
                    })
                    .text(function(){
                        if(on_paths_label == 1) {
                            if (value == '') {
                                return "0.00";
                            }
                            return Number(value).toPrecision(3);
                        }else{
                            return;
                        }
                    });
            }
        });
    }

    // if changes made to link charge
    function charge_inputted() {
        force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(links)
            .size([width, height])
            .linkDistance(function(d){
                return factor(d.value);
            })
            .charge(-500 * this.value)
            .on("tick", tick)
            .start();
    }

    // if changes made to link distance
    function distance_inputted() {
        factor = d3.scale.linear().domain([min_value, max_value]).range([this.value * 100, this.value * 300]);
        force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(links)
            .size([width, height])
            .linkDistance(function(d){
                return factor(d.value);
            })
            .charge(-500 * this.value)
            .on("tick", tick)
            .start();
    }

    // find neighbouring nodes
    function neighboring(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }

    // function upon double clicking on the nodes
    function connectedNodes() {
        if(toggle == 0) {
            toggle = 1;
            d = d3.select(this).node().__data__;
            // checked the checkbox
            $('input[name="nodes"]').each(function(){
                if($(this).val() == d.name){
                    $(this).prop('checked', true);
                }
            });
            node.style("opacity", function (o) {
                return neighboring(d, o) | neighboring(o, d) ? 1 : 0.05;
            });
            path.style("opacity", function (o) {
                return o.source === d || o.target === d ? 1 : 0.05;
            });
            // add the text to node with opacity 1
            $('.node').each(function (e) {
                if ($(this).css('opacity') == '1') {
                    var curr_node = d3.select(this);
                    curr_node.append("text")
                        .attr('class', 'node_text')
                        .attr("x", 12)
                        .attr("dy", ".35em")
                        .text(function (e) {
                            if (d.name == e.name) {
                                curr_node.select('circle').transition()
                                    .duration(750)
                                    .attr("r", 16)
                                    .style("fill", function (d) {
                                        highlighted.push(d.name);
                                        return 'orange';
                                    });
                            } else {
                                curr_node.select('circle').transition()
                                    .style("fill", function (d) {
                                        return 'orange';
                                    });
                            }
                            if(on_nodes_label == 1){
                                return e.name;
                            }else{
                                return;
                            }
                        });
                }
            })
            // add the text to path with opacity 1
            $('path').each(function (d) {
                if ($(this).css('opacity') == '1') {
                    var curr_path = d3.select(this);
                    var id = (curr_path.attr('id'));
                    var index = id.indexOf(',');
                    var value = id.substring(index+1, id.length - 1);
                    var thing = svg.append("g")
                        .attr("id", "thing")
                        .style("fill", "navy");
                    thing.append("text")
                        .style("font-size", "12px")
                        .attr("dy", -10)
                        .attr("dx", 20)
                        .append("textPath")
                        .attr("xlink:href", function (d) {
                            return '#' + id;
                        })
                        .text(function(){
                            if(on_paths_label == 1) {
                                if (value == '') {
                                    return "0.00";
                                }
                                return Number(value).toPrecision(3);
                            }else{
                                return;
                            }
                        });
                }
            });
        }else{
            returnOpacity();
        }
    }

    // return to original state
    function returnOpacity(){
        highlighted = [];
        // uncheck all checkbox
        $('input[name="nodes"]').each(function(){
            $(this).prop('checked', false);
        });
        node.style("opacity", 1);
        path.style("opacity", 1);
        $('.node_text').remove();
        $('textPath').remove();
        toggle = 0;
        $('.node').each(function (e) {
            d3.select(this).select("circle").transition()
                .duration(750)
                .attr("r", 6)
                .style("fill", "black");
        })
    }
}

// finding minimum spanning tree
function minimumSpanningTree(graph){
    var edges_used = [];
    var edges = graph.edges.slice();
    // Sort 'edges' so that the edges are in ascending order,
    // the last edge is the longest.
    edges.sort(function(a, b) {return a.value - b.value;});
    console.log(edges);
    // 1. Check if there is a cycle if the edges is pushed in
    // 2. If no cycle push into edges used
    // 3. Check till end of edges
    for(var i = 0; i < edges.length; i++){
        var check = check_cycle(edges[i].source, edges[i].target, edges_used);
        if(check == 0){
            edges_used.push(edges[i]);
        }
    }
    console.log(edges_used);
    return edges_used;
}

// The idea is after added the edge into edges used
// Iterating through it should not go back to starting point
function check_cycle(initial_pt, curr_pt, edges_used){
    var cycle = 0;
    var edges = edges_used.slice(0);
    // Get all the targets from next pt
    var next_pts = [];
    for(var i = 0; i < edges.length; i++){
        if(edges[i].source == curr_pt){
            next_pts.push(edges[i].target);
            if(edges[i].target == initial_pt){
                return 1;
            }
            continue;
        }
        if(edges[i].target == curr_pt){
            next_pts.push(edges[i].source);
            if(edges[i].source == initial_pt){
                return 1;
            }
            continue;
        }
    }
    for(var i = 0; i < next_pts.length; i++){
        var temp = edges.slice(0);
        for(var j = 0; j < temp.length; j++){
            if(temp[j].source == curr_pt && temp[j].target == next_pts[i]){
                temp.splice(j,1);
                break;
            }
            if(temp[j].target == curr_pt && temp[j].source == next_pts[i]){
                temp.splice(j,1);
                break;
            }
        }
        cycle = check_cycle(initial_pt, next_pts[i], temp);
        if(cycle == 1){
            return 1;
        }
    }
    return cycle;
}