// draw the leaf nodes
ld_distance = 0;
view_choice = 'dendrogram';
view_object = {
    'Dendrogram' : 'dendrogram',
    'distance - Cluttered' : 'clutteredr2',
    'distance - Expanded' : 'expandedr2'
};

function drawLeafNodesPlot(table, leaf_nodes_data, allDistances, newRow, plotId, leftPlotId, rightPlotId) {
    var textID = plotId + "_textRef";
    var refId = refSnp;

    if (newRow) {
        insertRow(table, leftPlotId, plotId, rightPlotId, false, false);
        $("#" + leftPlotId).empty();
        var html = "<br>Reference SNP: <input id=\'" + textID + "\' type='text' value='" + refSnp + "' readonly></input>";
        html += '<br><br>';
        // LD cut off
        html += "<div style=\"float: left;\">LD threshold : <select id='cutoff_select' onChange='updateLD(); allDistances = computeDistance(); dendogram = computeDendrogram(ld_distance); renderEverything();'>";
        html += $.map([0, 0.01, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], function(n, i) {
            if(n == ld_distance){
                return "<option selected=selected>" + n + "</option>";
            }else{
                return "<option>" + n + "</option>";
            }
        } ).join("");
        html += "</select>";
        html += "<br><br><b>View: </b>";
        // html += "<select id='view_choice' onChange='updateVC(); renderEverything();'> <option>Dendrogram</option><option>distance - Cluttered</option><option>distance - Expanded</option></select>";
        html += "<br><input type=\"radio\" id=\"dendrogram\" value='dendrogram' onclick='updateVC();renderEverything();' name=\"viewLeaf" + "\" style=\"margin-left:20px; margin-right:5px; margin-top: 5px;\">Dendrogram</input>";
        html += "<br><input type=\"radio\" id=\"clutteredr2\" value='clutteredr2' onclick='updateVC();renderEverything();' name=\"viewLeaf" + "\" style=\"margin-left:20px; margin-right:5px; margin-top: 5px;\"> r<sup>2</sup>distance - Cluttered</input>";
        html += "<br><input type=\"radio\" id=\"expandedr2\" value='expandedr2' onclick='updateVC();renderEverything();' name=\"viewLeaf" + "\" style=\"margin-left:20px; margin-right:5px; margin-top: 5px;\"> r<sup>2</sup>distance - Expanded</input>";
// html += "<br><input type=\"checkbox\" id=\"" + checkBoxID + "\"> Show by r2 distance from the ref SNP</input>";
        var initialHTML = $("#" + leftPlotId + "_td").html();
        $("#" + leftPlotId + "_td").html(initialHTML + html);
    }

    $('input:radio[name="viewLeaf"]').each(function(){
        if($(this).val() == view_choice){
            $(this).attr('checked','checked');
        }
    });

    // $('#view_choice option').each(function(){
    //     if(view_object[$(this).text()] == view_choice){
    //         $(this).attr('selected','selected');
    //     }
    // });

    $("#" + rightPlotId).empty();
    $("#" + plotId).empty();

    // if(view_object[$('#view_choice').val()] == 'dendrogram' ){
    //     var orderedPlot = false;
    // }else{
    //     var orderedPlot = true;
    // }
    //
    // if(view_object[$('#view_choice').val()] == 'clutteredr2' ){
    //     var clutteredPlot = true;
    // }else{
    //     var clutteredPlot = false;
    // }

    var orderedPlot = !($("#dendrogram").prop('checked'));
    var clutteredPlot = $("#clutteredr2").prop('checked');

    var addDendrogram = orderedPlot ? false : true;
// var orderedPlot = checkBoxID;

    var leaf_nodes = leaf_nodes_data;

    if (orderedPlot) {
        leaf_nodes = (allDistances.filter(function(d) {
            return d.nodes[0].refSnp.indexOf(refId) > -1;
        })).sort(function(a, b) {
            return b.ypos - a.ypos;
        });

        var distances = [];

        for (var i = 0; i < leaf_nodes.length; i++) {
            distances.push(leaf_nodes[i].ypos);
        }

        distances = distances.sort(function(a, b) {
            return b - a
        });

        var maxD = Math.max.apply(null, $.map(leaf_nodes, function(snp, i) {
            return snp.ypos;
        }));
        var minD = Math.min.apply(null, $.map(leaf_nodes, function(snp, i) {
            return snp.ypos;
        }));

    }

    var html = "<svg class=\"plot\" id=\"" + plotId + "\"></svg>";
    $("#" + plotId + "_td").html(html);

    var start = startRuler - 100;
    var end = endRuler + 100;
    var height = leaf_nodes.length * 15;
    var width = $("#" + plotId).width();

    var target = d3.select("#" + plotId).append("g").attr("id", plotId + "_leafNodes_plot").attr("transform", "translate(0,30)");
    target.selectAll("line").data(leaf_nodes).enter()
        .append("line")
        .attr("x1", function(d) {
            return (Math.min.apply(null, $.map(d.nodes[0].snps, function(snp, i) {
                return snps[snp].pos
            })) - start) / (end - start) * width
        })
        .attr("x2", function(d) {
            return (Math.max.apply(null, $.map(d.nodes[0].snps, function(snp, i) {
                return snps[snp].pos
            })) - start) / (end - start) * width
        })
        .attr("y1", function(d) {
            return (orderedPlot ? (clutteredPlot ? (maxD - d.ypos)/(maxD - minD) : (leaf_nodes.indexOf(d) + 1) / leaf_nodes.length) : d.ypos) * height + 5
        })
        .attr("y2", function(d) {
            return (orderedPlot ? (clutteredPlot ? (maxD - d.ypos)/(maxD - minD) : (leaf_nodes.indexOf(d) + 1) / leaf_nodes.length) : d.ypos) * height + 5
        })
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    target.selectAll("rect").data(function() {
        return $.map(leaf_nodes, function(node, i) {
            return $.map(node.nodes[0].snps, function(snp, j) {
                snps[snp].plot_x = (snps[snp].pos - start) / (end - start) * width;
                return {
                    snp: snp,
                    xpos: snps[snp].pos,
                    ypos: (orderedPlot ? (clutteredPlot ? (maxD - node.ypos)/(maxD - minD) : (leaf_nodes.indexOf(node) + 1) / leaf_nodes.length) : node.ypos),
                    displayText: snp + (orderedPlot ? " (" + node.ypos + ")" : "")
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

    if (orderedPlot) {
        var axis = d3.svg.axis().scale(d3.scale.linear().range([0, height]).domain([0, leaf_nodes.length - 1])).ticks(leaf_nodes.length - 1).tickFormat(function(d) {
            return distances[d];
        }).orient("right");
        if(clutteredPlot){
            axis = d3.svg.axis().scale(d3.scale.linear().range([0, height]).domain([maxD, minD])).ticks(leaf_nodes.length - 1).orient("right");
        }
        var rightWidth = $("#" + rightPlotId).width() - 30;
        d3.select("#" + rightPlotId).append("g").attr("id", "ordered_axis").attr("transform", "translate(0, 35)").call(axis);
    } else if (addDendrogram) {
        drawDendrogramPlot("table-1", dendrogram, false, rightPlotId, heightOfPlot);
        $("#" + plotId).closest('tr').attr("class", "dendrogram");
    }

    if (newRow) {
        $(function() {
            $("input[name=\"viewLeaf_" + plotId + "\"]").change(function() {
                drawLeafNodesPlot(table, leaf_nodes, allDistances, false, plotId, leftPlotId, rightPlotId);
                sizeAndFunctions([plotId]);
            })
        });

    }
}
