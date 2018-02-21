// draw the manhattan plot
function drawEmpty(table) {
    var tableId = "#" + table;
    var row = "<tr>";
    row += "<td class=\"dragHandle\"></td>";
    row += "<td class=\"leftSpace\">";
    row += "</td>";
    row += "<td class=\"mainContent\"></td>";
    row += "<td class=\"rightSpace\"></td>";
    row += "</tr>";
    $(tableId).html($("#" + table).html() + row);
}