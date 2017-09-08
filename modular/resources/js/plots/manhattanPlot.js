// draw the manhattan plot
function drawManhattanPlot(table, eqtls, newRow, plotId, leftPlotId, rightPlotId, selected_study) {
    if(newRow){
        insertRow(table, leftPlotId, plotId, rightPlotId, false, false);
        $("#" + leftPlotId).empty();
        $("#" + rightPlotId).empty();
        $("#" + plotId).empty();
    }

    var html = '<div class="mainMan_title" style="text-align:center; border:1px solid black;">'+ selected_study +'</div>';
    $("#" + plotId + "_td").append(html);

    var html = "<svg class=\"plot\" id=\"" + plotId + "\"></svg>";
    $("#" + plotId + "_td").append(html);

    var start = data.startRuler - 100;
    var end = data.endRuler + 100;
    var height = newRow ? 200 : $("#" + plotId).closest('svg').attr("height");
    var width = $("#" + plotId).width();

    var target = d3.select("#" + plotId).append("g").attr("id", plotId + "_manhattan_plot");
    // alert(eqtls);
    target.selectAll("circle").data(eqtls).enter()
        .append("circle")
        .attr("cx", function(d) {
            return (d.bp - start) / (end - start) * width
        })
        .attr("cy", function(d) {
            return d.neglog10p_unit * (height - 10) + 5
        })
        .attr("r", function(d) {
            return 4
        })
        .attr("transform", "translate(0, 10)")
        .attr("fill", function(d) {
            return "black"
        })
        .attr("id", function(d) {
            return d.displayText
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
            return d.neglog10p_unit * (height - 10) + 10
        })
        .attr("y2", function(d){
            return height
        })
        .attr("transform", "translate(0, 10)")
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
            return height-1.5
        })
        .attr("y2", function(d){
            return height-1.5
        })
        .attr("transform", "translate(0, 10)")
        .attr("stroke", "#000000")
        .attr("stroke-width", 1.5);

    var heightOfPlot = $("#" + plotId + "_manhattan_plot").get(0).getBBox().height + 10;

    var start = Math.min.apply(null, $.map(eqtls, function(d, i){
        return d.p;
    }));
    var end = Math.max.apply(null, $.map(eqtls, function(d, i){
        return d.p;
    }));

    html = "<svg class=\"plot\" id=\"" + rightPlotId + "\"></svg>";
    $("#" + rightPlotId + "_td").html(html);

    var axis = d3.svg.axis().scale(d3.scale.linear().range([0, height-2]).domain([start, end]).nice()).tickFormat(d3.format(".1e")).orient("right");
    var rightWidth = $("#" + rightPlotId).width() - 30;
    d3.select("#" + rightPlotId).append("g").attr("id",  rightPlotId + "_axis").attr("transform", "translate(0, 10)").call(axis);
    d3.select("#" + rightPlotId + "_axis").selectAll("text").attr("transform", "translate(0,-4)");
    d3.select("#" + rightPlotId).attr("transform", "translate(0,17)");

    if(newRow){
        $("#" + leftPlotId).closest('svg').attr('height', heightOfPlot);
        $("#" + rightPlotId).closest('svg').attr('height', heightOfPlot);
        $("#" + plotId).closest('svg').attr('height', heightOfPlot);
    }

}