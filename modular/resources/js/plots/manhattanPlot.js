// draw the manhattan plot
function drawManhattanPlot(table, eqtls, newRow, plotId, leftPlotId, rightPlotId, selected_study) {
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
    var height = newRow ? 255 : $("#" + plotId).closest('svg').attr("height");
    var width = $("#" + plotId).width();

    var scale_start = Math.min.apply(null, $.map(eqtls, function(d, i){
        return Math.floor(d.neglog10p);
    }));
    var scale_end = Math.max.apply(null, $.map(eqtls, function(d, i){
        return Math.ceil(d.neglog10p) + 1;
    }));
    var scale = d3.scale.linear().range([0, height-52]).domain([scale_start, scale_end]);

    d3.select('#'+ plotId).append('text').attr('x', width/2).attr('y', 20).attr('text-anchor','middle').attr('font-family','Verdana').attr('font-size','12px').text(selected_study);
    d3.select('#'+ plotId).append('rect').attr('x', 0).attr('y',5).attr('width',width).attr('height',20).style('fill','transparent').style('stroke','black').style('stroke-width','1px');

    var target = d3.select("#" + plotId).append("g").attr("id", plotId + "_manhattan_plot");
    target.selectAll("circle").data(eqtls).enter()
        .append("circle")
        .attr("cx", function(d) {
            return (d.bp - start) / (end - start) * width
        })
        .attr("cy", function(d) {
            return scale(d.neglog10p);
            // return d.neglog10p_unit * (height - 10) + 5
        })
        .attr("r", function(d) {
            return 4
        })
        .attr("transform", "translate(0, 42)")
        .attr("fill", function(d) {
            return "black"
        })
        .attr("id", function(d) {
            return d.displayText;
        });

    target.selectAll("line").data(eqtls).enter()
        .append("line")
        .attr("x1", function(d){
            return (d.bp - start) / (end - start) * width
        })
        .attr("x2", function(d){
            return (d.bp - start) / (end - start) * width
        })
        .attr("y1", function(d){
            return scale(d.neglog10p) + 12;
        })
        .attr("y2", function(d){
            return scale(scale_end) + 7;
        })
        .attr("transform", "translate(0, 35)")
        .attr("stroke", "#E0E0E0")
        .attr("stroke-width", 1.5)
        ;

    target.append("line")
        .attr("x1", function(d){
            return 0
        })
        .attr("x2", function(d){
            return width
        })
        .attr("y1", function(d){
            return height;
        })
        .attr("y2", function(d){
            return height;
        })
        .attr("transform", "translate(0, -10)")
        .attr("stroke", "#000000")
        .attr("stroke-width", 1.5);

    var heightOfPlot = 250;

    html = "<svg class=\"plot\" id=\"" + rightPlotId + "\"></svg>";
    $("#" + rightPlotId + "_td").html(html);

    // var axis = d3.svg.axis().scale(d3.scale.linear().range([0, height-24]).domain([start, end]).nice()).tickFormat(d3.format(".1e")).orient("right");
    var axis = d3.svg.axis().scale(d3.scale.linear().range([0, height-50]).domain([scale_end, scale_start]).nice()).tickFormat(d3.format(',.1f')).orient("right");
    var rightWidth = $("#" + rightPlotId).width() - 30;
    d3.select("#" + rightPlotId).append("g").attr("id",  rightPlotId + "_axis").attr("transform", "translate(0, 15)").call(axis);
    d3.select("#" + rightPlotId + "_axis").selectAll("text").attr("transform", "translate(0,-4)");
    d3.select("#" + rightPlotId).attr("transform", "translate(0,24)");
    d3.select("#" + rightPlotId).append('text').attr("id", rightPlotId + "_text").attr('x', 35).attr('y', heightOfPlot - 32).text('-neglog10(p)').style('font-style', 'italic');
    d3.select("#" + rightPlotId + "_text").attr("transform", "translate(260,40)rotate(90)");

    if(newRow){
        $("#" + leftPlotId).closest('svg').attr('height', heightOfPlot);
        $("#" + rightPlotId).closest('svg').attr('height', heightOfPlot);
        $("#" + plotId).closest('svg').attr('height', heightOfPlot);
    }
}
