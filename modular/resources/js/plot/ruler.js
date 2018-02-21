function drawAxis(table, leftPlotId, plotId, rightPlotId, startRuler, endRuler) {
    // insertRow(table, "leftGenomicAxis", "genomic_axis", "rightGenomicAxis", true, true);

    var start = startRuler - 100;
    var end = endRuler + 100;

    insertRow(table, leftPlotId, plotId, rightPlotId, true, true);

    $("#" + leftPlotId).empty();

    var html = "<button type=\"button\" class=\"btn ruler-btn\" onclick=\"dragSVG('left')\">";
    html += "<span class=\"glyphicon glyphicon-chevron-left\"></span>";
    html += "</button>";
    html += "<button type=\"button\" class=\"btn ruler-btn\" onclick=\"dragSVG('right')\">";
    html += "<span class=\"glyphicon glyphicon-chevron-right\"></span>";
    html += "</button>";
    html += "<button type=\"button\" class=\"btn ruler-btn\" onclick=\"zoomed(2);\">";
    html += "<span class=\"glyphicon glyphicon-zoom-in\"></span>";
    html += "</button>";
    html += "<button type=\"button\" class=\"btn ruler-btn\" onclick=\"zoomed(0.5);\">";
    html += "<span class=\"glyphicon glyphicon-zoom-out\"></span>";
    html += "</button>";

    var initialHTML = $("#" + leftPlotId + "_td").html();
    $("#" + leftPlotId + "_td").html(initialHTML + html);

    var html = "<svg class=\"plot\" id=\"" + plotId + "\"></svg>";
    $("#" + plotId + "_td").html(html);

    var width = $("#" + plotId).width();
    var target = d3.select("#" + plotId);
    var genomic_axis = d3.svg.axis().scale(d3.scale.linear().range([0, width]).domain([start, end])).orient("top");
    //alert(width);
    target.append("g").attr("id", plotId + "_genomicAxis").attr("transform", "translate(0, 20)").call(genomic_axis);

    var heightOfPlot = $("#" + plotId + "_genomicAxis").get(0).getBBox().height + 10;

    $("#" + leftPlotId).closest('svg').attr('height', heightOfPlot);
    $("#" + rightPlotId).closest('svg').attr('height', heightOfPlot);
    $("#" + plotId).closest('svg').attr('height', heightOfPlot);
}
