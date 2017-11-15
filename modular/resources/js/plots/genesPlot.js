// draw the genes
function drawGenesPlot(table, transcripts, newRow, plotId, leftPlotId, rightPlotId) {
    if(newRow){
        insertRow(table, leftPlotId, plotId, rightPlotId, false, false);
        $("#" + leftPlotId).empty();
        $("#" + rightPlotId).empty();
        $("#" + plotId).empty();
    }

    var html = "<svg class=\"plot center\" id=\"" + plotId + "\">";
    html += "<marker id=\"triangle_left\" viewBox=\"0 0 10 10\" refX=\"0\" refY=\"5\" markerWidth=\"8\" markerHeight=\"6\" orient=\"auto\">";
    html += "<path d=\"M 0 5 L 10 10 L 10 0 z\"/>";
    html += "</marker>";
    //Doesnt seem to be in use
    html += "<marker id=\"triangle_right\" viewBox=\"0 0 10 10\" refX=\"0\" refY=\"5\" markerWidth=\"7\" markerHeight=\"5\" orient=\"auto\">";
    html += "<path d=\"M 0 0 L 10 5 L 0 10 z\"/>";
    html += "</marker>";
    html += "</svg>";

    $("#" + plotId + "_td").html(html);

    var start = data.startRuler - 100;
    var end = data.endRuler + 100;
    var height = newRow ? transcripts.length * 20 : $("#" + plotId).closest('svg').attr("height");
    var width = $("#" + plotId).width() - 10;

    var target = d3.select("#" + plotId).append("g").attr("id", plotId + "_genes_plot");

    target.selectAll("path").data(transcripts).enter()
        .append("path")
        .attr("d", function(d){
            var y = d.ypos * height + 5;
            var startPos = (d.start - start) / (end - start) * width;
            var endPos = (d.end - start) / (end - start) * width;
            var val = "M" + startPos + ',' + y;
            for(var i = startPos + 30; i <= endPos; i += 30){
                val += "H" + i;
            }
            val += "H" + (endPos - 1);
            return val;
        })
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("marker-mid", function(d){
            return d.strand == "+" ? "url(#triangle_right)" : "url(#triangle_left)";
        });

    target.selectAll("rect").data(function() {
            return $.map(transcripts, function(transcript, i) {
                return $.map(transcript.exons, function(exon, j) {
                    exon.ypos = transcript.ypos;
                    exon.displayText = $.sprintf("Gene: %s Transcript: %s", transcript.gene, transcript.id);
                    return exon;
                });
            });
        }).enter()
        .append("rect")
        .attr("id", function(d){
            return d.displayText;
        })
        .attr("x", function(d) {
            return (d.start - start) / (end - start) * width;
        })
        .attr("width", function(d) {
            return (d.end - d.start) / (end - start) * width;
        })
        .attr("y", function(d) {
            return d.ypos * height
        })
        .attr("height", 10)
        .attr("fill", "blue");

    var heightOfPlot = $("#" + plotId + "_genes_plot").get(0).getBBox().height + 10;

    if(newRow){
        $("#" + leftPlotId).closest('svg').attr('height', heightOfPlot);
        $("#" + rightPlotId).closest('svg').attr('height', heightOfPlot);
        $("#" + plotId).closest('svg').attr('height', heightOfPlot);
    }
}
