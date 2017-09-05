function drawDendrogramPlot(table, node, newRow, plotId, leftPlotId, rightPlotId, leaf_nodes) {
  // console.log((node.nodes));
    if (node.nodes.length > 1) {
        if(newRow){
	    	insertRow(table, leftPlotId, plotId, rightPlotId, false, false);
	    	$("#" + leftPlotId).empty();
	    	$("#" + rightPlotId).empty();
	    	$("#" + plotId).empty();
	    }

        var height = newRow ? leaf_nodes.length * 15 : $("#" + plotId).closest('svg').attr("height") - 50;
        var width = $("#" + plotId).width() - 25;

        var genomic_axis = d3.svg.axis().scale(d3.scale.linear().range([0, width]).domain([1, 0])).orient("top");
        //svg.append("g").attr("id", "r2_axis").attr("transform", "translate(" + (genomic_width + 10) + ", " + ((data.transcripts.length * 15) + (data.leaf_nodes.length * 15) + 50 + manhattan_plot_height + 20) + ")").call(r2_axis);

        d3.select("#" + plotId).append("g").attr("id", plotId + "_genomicAxis").attr("transform", "translate(10, 20)").call(genomic_axis);

        var target = d3.select("#" + plotId).append("g").attr("id", plotId + "_leafNodes_plot").attr("transform", "translate(10, 30)");
        target.append("line")
            .attr("x1", node.xpos * width)
            .attr("x2", node.xpos * width)
            .attr("y1", node.nodes[0].ypos * height + 5)
            .attr("y2", node.nodes[node.nodes.length - 1].ypos * height + 5)
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        $.map(node.nodes, function(n, i) {
            target.append("line")
                .attr("x1", node.xpos * width)
                .attr("x2", n.xpos * width)
                .attr("y1", n.ypos * height + 5)
                .attr("y2", n.ypos * height + 5)
                .attr("stroke", "black")
                .attr("stroke-width", 1);
        });
        $.map(node.nodes, function(n, i) {
            drawDendrogramPlot(table, n, false, plotId);
        });

	    var heightOfPlot = $("#" + plotId + "_leafNodes_plot").get(0).getBBox().height + 10;
	    if(newRow){
		    $("#" + leftPlotId).closest('svg').attr('height', heightOfPlot);
		    $("#" + rightPlotId).closest('svg').attr('height', heightOfPlot);
		    $("#" + plotId).closest('svg').attr('height', heightOfPlot);
		}
    }
}
