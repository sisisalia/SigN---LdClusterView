function insertRow(table, leftPlotId, plotId, rightPlotId, nonDraggable, nonDroppable) {
    var tableId = "#" + table;
    //  var row = "<tr" + (nonDroppable ? " nodrop" : "") + (nonDraggable ? " nodrag" : "") + ">";
    var row = "<tr id=\"" + plotId + "_tr\"" + " class = \"" + (nonDraggable ? "nodrag" : "") + (nonDroppable ? " nodrop" : "") + "\">";
    row += "<td class=\"dragHandle\"></td>";
    row += "<td class=\"leftSpace\" id=\"" + leftPlotId + "_td\">";
    if(!nonDroppable && !nonDraggable)
        row += "<p class='glyphicon glyphicon-remove close-plot'></p>";
    // row += "<svg class=\"plot\" id=\"" + leftPlotId + "\">";
    // row += "</svg>";
    row += "</td>";
    row += "<td class=\"mainContent\" id=\"" + plotId + "_td\">"
    // row += "<svg class=\"plot\" id=\"" + plotId + "\">";
    // row += "</svg>";
    row += "</td>";
    row += "<td class=\"rightSpace\" id=\"" + rightPlotId + "_td\">";
    // row += "<svg class=\"plot\" id=\"" + rightPlotId + "\">";
    // row += "</svg>";
    row += "</td>"
    row += "</tr>";
    $(tableId).html($(tableId).html() + row);
}