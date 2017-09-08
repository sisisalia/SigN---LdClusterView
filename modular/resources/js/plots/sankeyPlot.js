function drawSankeyPlot(table, mqtls, newRow, plotId, leftPlotId, rightPlotId) {
    if(newRow){
        insertRow(table, leftPlotId, plotId, rightPlotId, false, false);
        $("#" + leftPlotId).empty();
        $("#" + rightPlotId).empty();
        $("#" + plotId).empty();
    }

    var html = "<svg class=\"plot\" id=\"" + plotId + "\"></svg>";
    $("#" + plotId + "_td").append(html);

    var start = data.startRuler - 100;
    var end = data.endRuler + 100;
    var height = newRow ? 200 : $("#" + plotId).closest('svg').attr("height");
    var width = $("#" + plotId).width();

    var svg = d3.select("#" + plotId).append("g").attr("id", plotId + "_sankey_plot");

    var sankey = d3.sankey()
        .nodeWidth(25) // was 15
        .nodePadding(20) // was 10
        .size([width, height]);

    var path = sankey.link();

    d3.csv("resources/js/data/mqtls.csv", function(d){

        var mqtls = {
            "nodes": [],
            "links": []
        };
        var mqtls_name = [];
        // The reason to have 'p' and 's' is to differentiate probe and snp in case they have the same position
        for(var i = 0; i < d.length; i++){
            if(mqtls_name.indexOf('p' + d[i].probe_position) == -1){
                mqtls_name.push('p' + d[i].probe_position);
                mqtls['nodes'].push({ 'name' : 'p' + d[i].probe_position });
            }
            if(mqtls_name.indexOf('s' + d[i].snp_position) == -1){
                mqtls_name.push('s' + d[i].snp_position);
                mqtls['nodes'].push({ 'name' : 's' + d[i].snp_position });
            }
        }
        for(i = 0; i < d.length; i++){
            var source = 'p' + d[i].probe_position;
            var target = 's' + d[i].snp_position;
            source = mqtls_name.indexOf(source);
            target = mqtls_name.indexOf(target);
            mqtls.links.push({'source' : source, 'target' : target, 'value' : d[i].p_value});
        }

        sankey.nodes(mqtls.nodes)
            .links(mqtls.links)
            .layout(32);

        var link = svg.append("g").selectAll(".link")
            .data(mqtls.links)
            .enter().append("path")
            .attr("class", function(d){
                // Manipulate link position
                var pos = parseInt(d.source.name.substring(1,d.source.name.length));
                d.source.x = (pos - start) / (end - start) * width;
                pos = parseInt(d.target.name.substring(1,d.target.name.length));
                d.target.x = (pos - start) / (end - start) * width;
                d.sy = 0;
                d.dy = 0;
                return 'link';
            })
            .style("stroke-width", function(d){
                console.log(d);
            })
            .style("stroke", function(d) { return d.source.color = 'gray'})
            .attr("d", path);

        var node = svg.append("g").selectAll(".node")
            .data(mqtls.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                var pos = parseInt(d.name.substring(1,d.name.length));
                var pos_x = (pos - start) / (end - start) * width;
                return "translate(" + pos_x + "," + d.y + ")";
            });

        node.append("rect")
            .attr("height", sankey.nodeWidth())
            .attr("width", function(d) { return 1; });

    });

    var heightOfPlot = $("#" + plotId + "_sankey_plot").get(0).getBBox().height + 200;

    if(newRow){
        $("#" + leftPlotId).closest('svg').attr('height', heightOfPlot);
        $("#" + rightPlotId).closest('svg').attr('height', heightOfPlot);
        $("#" + plotId).closest('svg').attr('height', heightOfPlot);
    }
}