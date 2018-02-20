function MST(data,spearman, kruskal, chi){
    // min p value for the statistical test
    var min_pvalue = 0.005;

    // circle radius
    var unselected_radius = 6;
    var selected_radius = 16;

    var obj = filteringProcess(data, spearman, kruskal, chi, min_pvalue);

    var nodes = obj.nodes;
    var links = obj.links;
    var max_value = obj.max_value;
    var min_value = obj.min_value;

    var graph = {};
    graph.nodes = nodes;
    graph.edges = links;

    // get the links to form MST
    links = minimumSpanningTree(graph);

    // add associated group
    var temp_links = links.slice(0);
    var group_counter = 0;
    var groups_obj = {};

    while(temp_links.length != 0){
        var targets = find_targets(temp_links, temp_links[0].source, group_counter);
        find_connected_graph(temp_links, targets, group_counter);
        group_counter++;
    }

    // number of nodes from the biggest
    var graph_nodes = [];
    // will store the key of groups_obj in descending order
    var graph_order = [];
    for(var i = 0; i < Object.keys(groups_obj).length; i++){
        var key = Object.keys(groups_obj)[i];
        var nodes_name = [];
        for(var j = 0; j < groups_obj[key].length; j++){
            var index = nodes_name.indexOf(groups_obj[key][j].source);
            if(index == -1){
                nodes_name.push(groups_obj[key][j].source);
            }
            index = nodes_name.indexOf(groups_obj[key][j].target);
            if(index == -1){
                nodes_name.push(groups_obj[key][j].target);
            }
        }
        graph_nodes.push(nodes_name.length);
    }

    var temp_graph_nodes = graph_nodes.slice(0);
    // sorting descending on the graph length
    temp_graph_nodes.sort(function(a, b) {return b - a});
    for(var i = 0; i < temp_graph_nodes.length; i++){
        var index = graph_nodes.indexOf(temp_graph_nodes[i]);
        graph_order.push(index);
    }

    // Add in graph buttons
    for(var i = 0; i < graph_order.length; i++){
        if(i == 0){
            $('#select_graph').append('<option value="'+ graph_order[i] +'" selected>Graph #'+ (i+1) +' ('+ temp_graph_nodes[i] +' nodes)</option>');
        }else{
            $('#select_graph').append('<option value="'+ graph_order[i] +'">Graph #'+ (i+1) +' ('+ temp_graph_nodes[i] +' nodes)</option>');
        }
    }

    var temp = groups_obj[graph_order[0]];
    createMST(temp);

    $('#select_graph').on('change',function(d){
        $('#mst-graph-svg').remove();
        var temp = groups_obj[$(this).val()];
        createMST(temp);
    });

    function createMST(choosen_links)
    {
        // default setting of nodes label and paths label
        var on_nodes_label = 1;
        var on_paths_label = 1;

        var saved_links = choosen_links.slice(0);

        nodes = {};

        // Compute the distinct nodes from the links.
        choosen_links.forEach(function (link) {
            if(!link.source.name) {
                link.source = nodes[link.source] ||
                    (nodes[link.source] = {name: link.source});
                link.target = nodes[link.target] ||
                    (nodes[link.target] = {name: link.target});
                link.value = +link.value;
            }else{
                link.source = link.source.name;
                link.target = link.target.name;
                link.source = nodes[link.source] ||
                    (nodes[link.source] = {name: link.source});
                link.target = nodes[link.target] ||
                    (nodes[link.target] = {name: link.target});
                link.value = +link.value;
            }
        });

        // Add nodes into the 'select node' menu
        $('#select_nodes').empty();
        var temp = Object.keys(nodes);
        // Add filtering text box
        $('#select_nodes').append('<table id="select_nodes_table"><thead><th class="filter nosort">Filter</th></thead><tbody>');
        for (var i = 0; i < temp.length; i++) {
            $('#select_nodes tbody').append('<tr class="select_nodes_checkbox"><td><input type="checkbox" name="nodes" value="' + temp[i] + '"><span class="select_nodes_label">' + temp[i] + '</span></td></td></tr>');
        }
        $('#select_nodes').append('</table>');

        $('#select_nodes_table').excelTableFilter();

        $('.glyphicon').each(function(d){
            $(this).removeClass('glyphicon-arrow-down');
        })

        // width and height in SVG
        var width = 900,
            height = 500;

        // default value where minimum is 50 and maximum is 150
        var factor = d3.scale.linear().domain([min_value, max_value]).range([50, 150]);

        var force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(choosen_links)
            .size([width, height])
            .linkDistance(function (d) {
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
        var v = d3.scale.linear().range([0, 1]);

        // Scale the range of the data
        v.domain([0, d3.max(choosen_links, function (d) {
            return d.value;
        })]);

        var svg = d3.select("#mst-graph").append("svg")
            .attr('id','mst-graph-svg')
            .attr("width", width)
            .attr("height", height);

        var counter = 0;
        // storing path source and target node
        var path_st = [];

        var path = svg.append("svg:g").selectAll("path")
            .data(force.links())
            .enter().append("svg:path")
            .attr('id', function (d) {
                // Prevent having same id for same value
                path_st.push([d.source.name, d.target.name]);
                counter++;
                return counter + ',' + d.effect_size;
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
        }

        graph.edges.forEach(function (d) {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
        });

        var showGraph = function(d){
            if(d.test == "Spearman Test"){
                $('#spearman-body-mst').empty();
                var json_data = jQuery.extend(true, {}, data);
                scatterPlotNumerical(d,json_data[d.source.name],json_data[d.target.name],d.source.name, d.target.name, '#spearman-body-mst', '#tooltip-container-mst');
                $('#modal-spearman-mst').modal('show');
            }
            if(d.test == 'Chi Square Test'){
                $('#chi-oe-table-mst').empty();
                var json_data = jQuery.extend(true, {}, data);
                constructChiOETable(json_data,d.source.name, d.target.name, '#chi-oe-table-mst');
                $('td').css('padding','5px');
                $('th').css('padding','5px');
                $('#modal-chi-mst').modal('show');
            }
            if(d.test == 'Kruskal Wallis'){
                $('#kruskal-graph-mst').empty();
                $('#kruskal-dunn-mst').empty();
                var json_data = jQuery.extend(true, {}, data);
                if(use_category.indexOf(d.source.name) != -1){
                    var cat_name = d.source.name;
                    var num_name = d.target.name;
                }else{
                    var num_name = d.source.name;
                    var cat_name = d.target.name;
                }
                removeNA(json_data[cat_name],json_data[num_name]);
                removeOneSample(json_data[cat_name],json_data[num_name]);
                scatterPlotCategorical(d,json_data[cat_name],json_data[num_name],cat_name, num_name, '#kruskal-graph-mst', '#tooltip-container-mst');
                $('#kruskal-dunn-mst').html('<div id="dunn">\n' +
                    '    <hr />\n' +
                    '    <table id="dunn_table"></table>\n' +
                    '    <hr />\n' +
                    '</div>\n');
                // Testing Categorical and Numerical
                BindTable(d.dunn, '#dunn_table');
                $('#modal-kruskal-mst').modal('show');
            }
        };

        // variable to toggle when user double click on the nodes
        var toggle = 0;

        // Add tooltip
        var tooltip = d3.select('#tooltip-container-mst').append("div")
            .attr("class", "tooltip");

        // tooltip mouseover event handler on path value
        var tipMouseoverMST = function (d) {
            // does not allow mouseover when the label is shown upon clicking
            if (toggle == 1 && on_paths_label == 1) {
                return;
            }

            if($(this).css('opacity') != '1'){
                return;
            }

            var html = '<span>value : ' + (d.effect_size).toPrecision(3) + '</span>';

            tooltip.html(html)
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
                .transition()
                .duration(200) // ms
                .style('background-color', '#c5fad3')
                .style("opacity", 0.9) // started as 0!

        };

        // tooltip mouseover event handler on nodes
        var nodeMouseoverMST = function (d) {
            // does not allow mouseover when the label is shown upon clicking
            if (toggle == 1 && on_nodes_label == 1) {
                return;
            }

            if($(this).css('opacity') != 1){
                return;
            }

            var html = '<span>' + d.name + '</span>';

            tooltip.html(html)
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
                .transition()
                .duration(200) // ms
                .style('background-color', 'lightblue')
                .style("opacity", 0.9) // started as 0!
        };

        // tooltip mouseout event handler
        var tipMouseoutMST = function (d) {
            tooltip.style('opacity', 0);
        };

        // add the nodes
        node.append("circle")
            .attr("r", unselected_radius)
            .on('dblclick', connectedNodes)
            .on("mouseover", nodeMouseoverMST)
            .on("mouseout", tipMouseoutMST);

        var on_mst = 0;

        // reset graph and settings
        $('#mst_reset').on('click',function(d){
            $('#nodes_label').prop('checked', true);
            $('#paths_label').prop('checked', true);
            $('input[type="range"]').val(0.5);
            $('#mst-graph-svg').remove();
            var temp = groups_obj[$('#select_graph').val()];
            createMST(temp);
            returnOpacity();
        })

        // add the lines
        function tick() {
            path.attr("d", function (d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y;

                return "M" +
                    d.source.x + "," +
                    d.source.y + "L" +
                    d.target.x + "," +
                    d.target.y;
            });

            path.style("stroke", function(d){
                if($(this).css('stroke') == 'rgb(255, 0, 0)') return 'red';
                else {return 'blue';}
            })
                .style("stroke-width", '2')
                .on('click', showGraph)
                .on("mouseover", tipMouseoverMST)
                .on("mouseout", tipMouseoutMST);

            node.attr("transform", function (d) {
                d.x = Math.max(unselected_radius, Math.min(width - unselected_radius, d.x));
                d.y = Math.max(unselected_radius, Math.min(height - unselected_radius, d.y));
                return "translate(" + d.x + "," + d.y + ")";
            });
        }

        // storing nodes which has been highlighted on the checkbox, allow multiple selection
        var highlighted = [];

        // highlight nodes which are checked on checkbox
        $("input[name='nodes']").change(function () {
            if ($(this).is(":checked")) {
                highlighted.push($(this).val());
            } else {
                var index = highlighted.indexOf($(this).val());
                if (index != -1) {
                    highlighted.splice(index, 1);
                }
            }
            if (highlighted.length != 0) {
                highlightNode(highlighted);
                if(highlighted.length > 1) {
                    var mst_links = [];
                    var mst_nodes = [];
                    var temp_nodes = [];
                    for (var i = 0; i < saved_links.length; i++) {
                        var index = temp_nodes.indexOf(saved_links[i].source.name);
                        if (index == -1) {
                            temp_nodes.push(saved_links[i].source.name);
                            var obj1 = {};
                            obj1.index = temp_nodes.length - 1;
                            obj1.value = saved_links[i].source.name;
                            obj1.r = 6;
                            mst_nodes.push(obj1);
                        }
                        var index = temp_nodes.indexOf(saved_links[i].target.name);
                        if (index == -1) {
                            temp_nodes.push(saved_links[i].target.name);
                            var obj1 = {};
                            obj1.index = temp_nodes.length - 1;
                            obj1.value = saved_links[i].target.name;
                            obj1.r = 6;
                            mst_nodes.push(obj1);
                        }
                        var obj = {};
                        obj.source = temp_nodes.indexOf(saved_links[i].source.name);
                        obj.target = temp_nodes.indexOf(saved_links[i].target.name);
                        obj.distance = saved_links[i].value;
                        mst_links.push(obj);
                    }
                    var sp = new ShortestPathCalculator(mst_nodes, mst_links);
                    highlightMSTPath(temp_nodes,sp);
                }
                toggle = 1;
            } else {
                returnOpacity();
            }
        });

        function highlightMSTPath(temp_nodes,sp){
            var nodes_used = [];
            // Highlight the path
            for(var i = 0; i < highlighted.length; i++){
                on_mst = 1;
                if(!highlighted[i+1]) continue;
                var source = temp_nodes.indexOf(highlighted[i]);
                var target = temp_nodes.indexOf(highlighted[i+1]);
                var route = sp.findRoute(source,target);
                for(var j = 0; j < route.path.length; j++){
                    var node1 = temp_nodes[route.path[j].target];
                    var node2 = temp_nodes[route.path[j].source];
                    var index = nodes_used.indexOf(node1);
                    if(index == -1) nodes_used.push(node1);
                    var index = nodes_used.indexOf(node2);
                    if(index == -1) nodes_used.push(node2);
                    var temp_array = [node1,node2];
                    for(var k = 0; k < choosen_links.length; k++){
                        if(node1 == choosen_links[k].source.name && node2 == choosen_links[k].target.name){
                            for(var l = 0; l < path_st.length; l++){
                                var result = arrayIsEqual(path_st[l],temp_array);
                                if(result == 1){
                                    var es = choosen_links[k].effect_size;
                                    var id = (l+1) + ',' + es;
                                    $('path').each(function(d){
                                        if($(this).attr('id') == id){
                                            $(this).css('stroke','red');
                                            $(this).css('opacity',1);
                                            return false;
                                        }
                                    });
                                    break;
                                }
                            }
                            continue;
                        }
                        if(node1 == choosen_links[k].target.name && node2 == choosen_links[k].source.name){
                            for(var l = 0; l < path_st.length; l++){
                                var result = arrayIsEqual(path_st[l],temp_array);
                                if(result == 1){
                                    var es = choosen_links[k].effect_size;
                                    var id = (l+1) + ',' + es;
                                    $('path').each(function(d){
                                        if($(this).attr('id') == id){
                                            $(this).css('stroke','red');
                                            $(this).css('opacity',1);
                                            return false;
                                        }
                                    });
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // Highlight nodes which passed through by MST
            $('.node').each(function(){
                d = d3.select(this).node().__data__;
                if(nodes_used.indexOf(d.name) != -1){
                    var curr_node = d3.select(this);
                    curr_node.select('circle').transition()
                        .attr("r", function(d){
                            if(highlighted.indexOf(d.name) != -1) return selected_radius;
                            else return unselected_radius;
                        })
                        .style("fill", function (d) {
                            return 'orange';
                        });
                    curr_node.append("text")
                        .attr('class', 'node_text')
                        .attr("x", 12)
                        .attr("dy", ".35em")
                        .text(function (e) {
                            if (on_nodes_label == 1) {
                                return e.name;
                            } else {
                                return;
                            }
                        });
                    $(this).css('opacity',1);
                }
            });

            // Add text to the path
            // add the text to path with opacity 1
            addPathText();
        }

        function arrayIsEqual(array1, array2){
            if(array1.length != array2.length) return 0;
            for( var i = 0; i < array1.length; i++){
                var index = array2.indexOf(array1[i]);
                if(index == -1) return 0;
            }
            return 1;
        }

        // toggling function on nodes label
        $('#nodes_label').on('click', function (d) {
            if (on_nodes_label == 1) on_nodes_label = 0;
            else {
                on_nodes_label = 1;
            }
            if (toggle == 1) {
                highlightNode(highlighted);
                if (highlighted.length > 1) {
                    var mst_links = [];
                    var mst_nodes = [];
                    var temp_nodes = [];
                    for (var i = 0; i < saved_links.length; i++) {
                        var index = temp_nodes.indexOf(saved_links[i].source.name);
                        if (index == -1) {
                            temp_nodes.push(saved_links[i].source.name);
                            var obj1 = {};
                            obj1.index = temp_nodes.length - 1;
                            obj1.value = saved_links[i].source.name;
                            obj1.r = unselected_radius;
                            mst_nodes.push(obj1);
                        }
                        var index = temp_nodes.indexOf(saved_links[i].target.name);
                        if (index == -1) {
                            temp_nodes.push(saved_links[i].target.name);
                            var obj1 = {};
                            obj1.index = temp_nodes.length - 1;
                            obj1.value = saved_links[i].target.name;
                            obj1.r = unselected_radius;
                            mst_nodes.push(obj1);
                        }
                        var obj = {};
                        obj.source = temp_nodes.indexOf(saved_links[i].source.name);
                        obj.target = temp_nodes.indexOf(saved_links[i].target.name);
                        obj.distance = saved_links[i].value;
                        mst_links.push(obj);
                    }
                    var sp = new ShortestPathCalculator(mst_nodes, mst_links);
                    highlightMSTPath(temp_nodes, sp);
                }
            }
        })

        // change cursor
        $('path').hover(function(){
            if($(this).css('opacity') == 1) $(this).css('cursor','pointer');
            else{
                $(this).css('cursor','default');
            }
        })

        // toggling function on path label
        $('#paths_label').on('click', function (d) {
            if (on_paths_label == 1) on_paths_label = 0;
            else {
                on_paths_label = 1;
            }
            if (toggle == 1) {
                highlightNode(highlighted);
                if(highlighted.length > 1) {
                    var mst_links = [];
                    var mst_nodes = [];
                    var temp_nodes = [];
                    for (var i = 0; i < saved_links.length; i++) {
                        var index = temp_nodes.indexOf(saved_links[i].source.name);
                        if (index == -1) {
                            temp_nodes.push(saved_links[i].source.name);
                            var obj1 = {};
                            obj1.index = temp_nodes.length - 1;
                            obj1.value = saved_links[i].source.name;
                            obj1.r = unselected_radius;
                            mst_nodes.push(obj1);
                        }
                        var index = temp_nodes.indexOf(saved_links[i].target.name);
                        if (index == -1) {
                            temp_nodes.push(saved_links[i].target.name);
                            var obj1 = {};
                            obj1.index = temp_nodes.length - 1;
                            obj1.value = saved_links[i].target.name;
                            obj1.r = unselected_radius;
                            mst_nodes.push(obj1);
                        }
                        var obj = {};
                        obj.source = temp_nodes.indexOf(saved_links[i].source.name);
                        obj.target = temp_nodes.indexOf(saved_links[i].target.name);
                        obj.distance = saved_links[i].value;
                        mst_links.push(obj);
                    }
                    var sp = new ShortestPathCalculator(mst_nodes, mst_links);
                    highlightMSTPath(temp_nodes, sp);
                }
            }
        })

        // highlight nodes according to the array
        function highlightNode(array) {
            // console.log(array);
            // dimmed all the nodes and path
            node.style("opacity", 0.05);
            path.style("opacity", 0.05);
            path.style("stroke", 'blue');
            $('.node_text').remove();
            $('textPath').remove();
            // return the circle to original state
            $('.node').each(function (e) {
                d3.select(this).select("circle").transition()
                    .duration(750)
                    .attr("r", unselected_radius)
                    .style("fill", "black");
            });
            // highlight the nodes selected and its neighbour
            $('.node').each(function (e) {
                d = d3.select(this).node().__data__;
                if (array.indexOf(d.name) != -1) {
                    node.style("opacity", function (o) {
                        if (neighboring(d, o) | neighboring(o, d)) {
                            return 1;
                        } else {
                            if ($(this).css('opacity') == 1) {
                                return 1;
                            } else {
                                return 0.05;
                            }
                        }
                    });
                    path.style("opacity", function (o) {
                        if (o.source === d || o.target === d) {
                            return 1;
                        } else {
                            if ($(this).css('opacity') == 1) {
                                return 1;
                            } else {
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
                            if (array.indexOf(e.name) != -1) {
                                curr_node.select('circle').transition()
                                    .duration(750)
                                    .attr("r", 16)
                                    .style("fill", function (d) {
                                        return 'orange';
                                    });
                            } else {
                                curr_node.select('circle').transition()
                                    .attr("r", 6)
                                    .style("fill", function (d) {
                                        return 'orange';
                                    });
                            }
                            if (on_nodes_label == 1) {
                                return e.name;
                            } else {
                                return;
                            }
                        });
                }
            })

            // add the text to path with opacity 1
            addPathText();
        }

        // if changes made to link charge
        function charge_inputted() {
            force = d3.layout.force()
                .nodes(d3.values(nodes))
                .links(choosen_links)
                .size([width, height])
                .linkDistance(function (d) {
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
                .links(choosen_links)
                .size([width, height])
                .linkDistance(function (d) {
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
            if (toggle == 0) {
                toggle = 1;
                d = d3.select(this).node().__data__;
                // checked the checkbox
                $('input[name="nodes"]').each(function () {
                    if ($(this).val() == d.name) {
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
                                        .attr("r", selected_radius)
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
                                if (on_nodes_label == 1) {
                                    return e.name;
                                } else {
                                    return;
                                }
                            });
                    }
                });
                addPathText();
            } else {
                returnOpacity();
            }
        }

        function addPathText(){
            // add the text to path with opacity 1
            $('path').each(function (d) {
                if ($(this).css('opacity') == '1') {
                    var curr_path = d3.select(this);
                    var id = (curr_path.attr('id'));
                    var index = id.indexOf(',');
                    var value = id.substring(index + 1, id.length);
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
                        .text(function () {
                            if (on_paths_label == 1) {
                                return Number(value).toPrecision(3);
                            } else {
                                return;
                            }
                        });
                }
            });
        }

        // return to original state
        function returnOpacity() {
            on_mst = 0;
            highlighted = [];
            // uncheck all checkbox
            $('input[name="nodes"]').each(function () {
                $(this).prop('checked', false);
            });
            node.style("opacity", 1);
            path.style("opacity", 1);
            path.style("stroke", 'blue');
            $('.node_text').remove();
            $('textPath').remove();
            toggle = 0;
            $('.node').each(function (e) {
                d3.select(this).select("circle").transition()
                    .duration(750)
                    .attr("r", unselected_radius)
                    .style("fill", "black");
            })
        }
    }

    // finding connected graph
    function find_connected_graph(temp_links, targets, group_counter){
        if(targets.length == 0) return;
        for(var i = 0 ; i < targets.length; i++){
            var child_targets = find_targets(temp_links, targets[i], group_counter);
            if(child_targets.length != 0){
                find_connected_graph(temp_links, child_targets, group_counter);
            }
        }
    }

    // finding multiple or one target node given a starting node
    function find_targets(temp_links, start_node, group_counter){
        targets = [];
        for(var i = 0; i < temp_links.length; i++){
            if(temp_links[i].source == start_node){
                targets.push(temp_links[i].target);
                if(!groups_obj[group_counter]){
                    groups_obj[group_counter] = [temp_links[i]];
                }else{
                    groups_obj[group_counter].push(temp_links[i]);
                }
                temp_links.splice(i,1);
                i--;
                continue;
            }
            if(temp_links[i].target == start_node){
                targets.push(temp_links[i].source);
                if(!groups_obj[group_counter]){
                    groups_obj[group_counter] = [temp_links[i]];
                }else{
                    groups_obj[group_counter].push(temp_links[i]);
                }
                temp_links.splice(i,1);
                i--;
                continue;
            }
        }
        return targets;
    }
}

function filteringProcess(data, spearman, kruskal, chi, min_pvalue){
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
        obj.value = 1 - Number(spearman[i].rho2);
        obj.effect_size = Number(spearman[i].rho2);
        obj.test = 'Spearman Test';
        obj.pvalue = spearman[i].pvalue;
        obj.pvalue_adj = spearman[i].pvalue_adj;
        obj.rho = spearman[i].rho;
        obj.rho2 = spearman[i].rho2;
        obj.x = spearman[i].x;
        obj.y = spearman[i].y;
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
        obj.pvalue = kruskal[i].pvalue;
        obj.pvalue_adj = kruskal[i].pvalue_adj;
        obj.x = kruskal[i].x;
        obj.y = kruskal[i].y;
        // obj.value = kruskal[i].pvalue/kruskal[i].n;
        var json_data = jQuery.extend(true, {}, data);
        for(var j = 0; j < Object.keys(json_data).length; j++){
            var key = Object.keys(json_data)[j];
            if(key == obj.source){
                var data_source = json_data[key];
            }
            if(key == obj.target){
                var data_target = json_data[key];
            }
        }
        var dunn = runKruskalWallisDunnPostHocTest(data_source,data_target);
        obj.dunn = dunn;
        var max_z_value = -99999;
        for(var j = 0; j < dunn.length; j++){
            var z_value = Math.pow(dunn[j].zvalue,2);
            if(z_value > max_z_value) max_z_value = z_value;
        }
        var effect_size = max_z_value/kruskal[i].n;
        obj.value = 1 - effect_size;
        obj.effect_size = effect_size;
        obj.test = 'Kruskal Wallis';
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
        obj.value = 1 - Number(chi[i].cramer_v);
        obj.effect_size = Number(chi[i].cramer_v);
        obj.test = 'Chi Square Test';
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

    var obj = {};
    obj.nodes = nodes;
    obj.links = links;
    obj.min_value = min_value;
    obj.max_value = max_value;
    return obj;
}

// finding minimum spanning tree
function minimumSpanningTree(graph){
    var edges_used = [];
    var edges = graph.edges.slice();
    // Sort 'edges' so that the edges are in ascending order,
    // the last edge is the longest.
    edges.sort(function(a, b) {return a.value - b.value;});
    // console.log(edges);
    // 1. Check if there is a cycle if the edges is pushed in
    // 2. If no cycle push into edges used
    // 3. Check till end of edges
    for(var i = 0; i < edges.length; i++){
        var check = check_cycle(edges[i].source, edges[i].target, edges_used);
        if(check == 0){
            edges_used.push(edges[i]);
        }
    }
    // console.log(edges_used.length);
    // for(var i = 0; i < edges_used.length; i++){
    //     console.log(edges_used[i].source, edges_used[i].target, edges_used[i].value, edges_used[i].test );
    // }
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