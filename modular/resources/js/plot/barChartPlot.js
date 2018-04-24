function drawBarChartPlot(table, methyl_data, newRow, leftPlotId, rightPlotId, plotId, selected_probe) {
    if (newRow) {
        this.insertRow(table, leftPlotId, plotId, rightPlotId, false, false);
        $("#" + leftPlotId).empty();
        $("#" + rightPlotId).empty();
        $("#" + plotId).empty();
    }
    // $("#" + plotId + "_td").append(html);

    var html = "<svg class=\"plot\" id=\"" + plotId + "\"></svg>";
    $("#" + plotId + "_td").append(html);

    var start = this.startRuler;
    var end = this.endRuler;
    var height = newRow ? 250 : $("#" + plotId).closest('svg').attr("height");
    var width = $("#" + plotId).width();

    d3.select('#' + plotId).append('text').attr('x', width / 2).attr('y', 20).attr('text-anchor', 'middle').attr('font-family', 'Verdana').attr('font-size', '12px').text(selected_probe);
    d3.select('#' + plotId).append('rect').attr('x', 0).attr('y', 5).attr('width', width).attr('height', 20).style('fill', 'transparent').style('stroke', 'black').style('stroke-width', '1px');

    var target = d3.select("#" + plotId).append("g").attr("id", plotId + "_barchart_plot");

    var probes = methyl_data[selected_probe].probes;

    var probes_size = Object.keys(probes).length;

    for (var i = 0; i < probes_size; i++) {
        var probe = probes[Object.keys(probes)[i]];
        target.append("rect")
            .attr("x", function (d) {
                return (probe.position - start) / (end - start) * width;
            })
            .attr("y", function (d) {
                return (1 - probe.average_beta) * (height - 60) + 26;
            })
            .attr("width", function (d) {
                return 1;
            })
            .attr("height", function (d) {
                return probe.average_beta * (height - 77);
            })
            .attr('id', function (d) {
                var text = 'Probe:' + Object.keys(probes)[i] + ' Position:' + probe.position + ' Average beta:' + probe.average_beta;
                return text;
            });
    }

    target.append("rect")
        .attr("x", 0)
        .attr("y", 190)
        .attr("width", width)
        .attr("height", 40)
        .attr('fill','white')
        .attr('class','block');

    target.append("line")
        .attr("x1", function (d) {
            return 0
        })
        .attr("x2", function (d) {
            return width
        })
        .attr("y1", function (d) {
            return height - 70
        })
        .attr("y2", function (d) {
            return height - 70
        })
        .attr("transform", "translate(0, 10)")
        .attr("stroke", "#000000")
        .attr("stroke-width", 1.5);

    var heightOfPlot = 210;

    if (newRow) {
        $("#" + leftPlotId).closest('svg').attr('height', heightOfPlot);
        $("#" + rightPlotId).closest('svg').attr('height', heightOfPlot);
        $("#" + plotId).closest('svg').attr('height', heightOfPlot);
    }

    var start = 1;
    var end = 0;

    html = "<svg class=\"plot\" id=\"" + rightPlotId + "\"></svg>";
    $("#" + rightPlotId + "_td").html(html);

    var axis = d3.svg.axis().scale(d3.scale.linear().range([0, height - 90]).domain([start, end]).nice()).orient("right");
    d3.select('#' + rightPlotId).append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 150)
        .attr("height", heightOfPlot - 30)
        .attr('fill','white')
        .attr('class','block');
    d3.select("#" + rightPlotId).append("g").attr("id", rightPlotId + "_axis").attr("transform", "translate(7, 12)").call(axis);
    d3.select("#" + rightPlotId).attr("transform", "translate(0,16.5)");
    d3.select("#" + rightPlotId).attr('height', heightOfPlot);
    // d3.select("#" + rightPlotId).attr("fill", "white");
    d3.select("#" + rightPlotId).append('text').attr('id', rightPlotId + "_text").attr('x', 35).attr('y', heightOfPlot - 17).text('average beta').style('font-style', 'italic');
    d3.select("#" + rightPlotId + "_text").attr("transform", "translate(240,22.5)rotate(90)");
}
