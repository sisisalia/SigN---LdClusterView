// draw the leaf nodes
function drawOrderedLeafNodesPlot(table, leaf_nodes, refId) {


    leaf_nodes = (leaf_nodes.filter(function(d) {
        return d.nodes[0].refSnp.indexOf(refId) > -1;
    })).sort(function(a, b){
        return b.ypos-a.ypos;
    });

    var maxD = Math.max.apply(null, $.map(leaf_nodes, function(snp, i){
        return snp.ypos;
    }));
    var minD = Math.min.apply(null, $.map(leaf_nodes, function(snp, i){
        return snp.ypos;
    }));

    var leftPlotId = "left_orderedLeafNodesPlot";
    var plotId = "orderedLeafNodesPlot";
    var rightPlotId = "right_orderedLeafNodesPlot";

    $("#orderedLeafNodesPlot").closest('tr').remove();

    insertRow(table, leftPlotId, plotId, rightPlotId, false, false);

    var html = "<svg class=\"plot\" id=\"" + plotId + "\"></svg>";
    $("#" + plotId + "_td").html(html);

    $("#" + leftPlotId).empty();
    $("#" + rightPlotId).empty();
    $("#" + plotId).empty();

    var start = data.snps[snp_order[0]].pos - 100;
    var end = data.snps[snp_order[snp_order.length - 1]].pos + 100;
    var height = leaf_nodes.length * 15;
    var width = $("#" + plotId).width();

    var target = d3.select("#" + plotId).append("g").attr("id", plotId + "_orderedLeafNodes_plot").attr("transform", "translate(0,30)");
    target.selectAll("line").data(leaf_nodes).enter()
        .append("line")
        .attr("x1", function(d) {
            return (Math.min.apply(null, $.map(d.nodes[0].snps, function(snp, i) {
                return data.snps[snp].pos
            })) - start) / (end - start) * width
        })
        .attr("x2", function(d) {
            return (Math.max.apply(null, $.map(d.nodes[0].snps, function(snp, i) {
                return data.snps[snp].pos
            })) - start) / (end - start) * width
        })
        .attr("y1", function(d) {
            return (maxD - d.ypos)/(maxD - minD) * height + 5
        })
        .attr("y2", function(d) {
            return (maxD - d.ypos)/(maxD - minD) * height + 5
        })
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    target.selectAll("rect").data(function() {
            return $.map(leaf_nodes, function(node, i) {
                return $.map(node.nodes[0].snps, function(snp, j) {
                    data.snps[snp].plot_x = (data.snps[snp].pos - start) / (end - start) * width;
                    return {
                        snp: snp,
                        xpos: data.snps[snp].pos,
                        ypos: (maxD - node.ypos)/(maxD - minD),
                        displayText: snp + " (" + (1 - node.ypos) + ")"
                    };
                });
            });
        }).enter()
        .append("rect")
        .attr("id", function(d) {
            return d.displayText;
        })
        .attr("x", function(d) {
            return (d.xpos - start) / (end - start) * width
        })
        .attr("width", 2)
        .attr("y", function(d) {
            return d.ypos * height
        })
        .attr("height", 10)
        .attr("fill", "black");

    var heightOfPlot = height + 40;


html = "<svg class=\"plot\" id=\"" + rightPlotId + "\"></svg>";
    $("#" + rightPlotId + "_td").html(html);

    $("#" + leftPlotId).closest('svg').attr('height', heightOfPlot);
    $("#" + rightPlotId).closest('svg').attr('height', heightOfPlot);
    $("#" + plotId).closest('svg').attr('height', heightOfPlot);

    var axis = d3.svg.axis().scale(d3.scale.linear().range([0, height]).domain([maxD, minD])).orient("right");
    var rightWidth = $("#right_orderedLeafNodesPlot").width() - 30;
    d3.select("#right_orderedLeafNodesPlot").append("g").attr("id",  "ordered_axis").attr("transform", "translate(0, 35)").call(axis);

    // sizeAndFunctions();

}
