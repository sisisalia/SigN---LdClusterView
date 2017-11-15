function addEvents(mainSVGid, plotType, plotId) {
    // Define drag beavior
    // Define drag beavior
    var drag = d3.behavior.drag()
        .on("dragstart", function(d) {
            data.startDrag = data.startRuler;
        })
        .on("drag", dragmove)
        .on("dragend", function() {
            if (data.startDrag != data.startRuler) {
                // getData();
                renderEverything();
            }
        });

    var zoom = d3.behavior.zoom()
        .scaleExtent([-10, 10])
        .on("zoom", zoomed);

    function dragmove(d) {
        var x = d3.event.dx;
        var shift = Math.round((data.endRuler - data.startRuler) / $("#" + plotId).width() * x);
        data.startRuler -= shift;
        data.endRuler -= shift;
        $("#studyDataText").attr("value", data.gene.chr + ": " + data.startRuler + " - " + data.endRuler);
    }

    d3.select("#" + plotId).call(drag);
    d3.select("#" + plotId).call(zoom).on('wheel.zoom', null);

    if (plotType.toLowerCase().startsWith("manhattan")) {
        element = d3.select("#" + plotId + "_manhattan_plot");

    // if (selected_study.length != 0) {
    //   for(var i = 0; i < selected_study.length ; i++){
    //     element = d3.select("#" + 'mainMan' + i + "_manhattan_plot");
        //console.log(element);
        element.selectAll("circle")
            .on("mouseover", function(d) {
                //Get this bar's x/y values, then augment for the tooltip
                var xPosition = d3.event.x + $(window).scrollLeft();
                var yPosition = d3.event.y + $(window).scrollTop();
                var text = d3.select(this).attr("id");
                //Update the tooltip position and value
                d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .style("width", "250px")
                    .select("#value")
                    .text(function(p) {
                        return text;
                    });

                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function(d) {
                d3.select("#tooltip").classed("hidden", true);
            })
            .on("click", function(d) {
                // reorderClustersByReferenceSnp(d.snp);
                //window.open("http://bioserver1.sign.a-star.edu.sg:9000/snp/" + d.snp);
            });
          }

    if (plotType.toLowerCase().startsWith("genes")) {
        if (geneClicked == undefined)
            var geneClicked = false;

        element = d3.select("#" + plotId + "_genes_plot");
        //console.log(element);
        element.selectAll("rect")
            .on("mouseover", function(d) {
                //Get this bar's x/y values, then augment for the tooltip
                var xPosition = d3.event.x + $(window).scrollLeft();
                var yPosition = d3.event.y + $(window).scrollTop();
                var text = d3.select(this).attr("id");
                //Update the tooltip position and value
                d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .style("width", "auto")
                    .select("#value")
                    .text(function(p) {
                        return text;
                    });

                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function(d) {
                d3.select("#tooltip").classed("hidden", true);
            })
            .on("click", function(d) {
                // console.log(d3.mouse(d3.select("#" + mainSVGid)));
                var hoverSvg = d3.select("#" + mainSVGid);
                var offsetVal = d3.select(this).attr("x");
                var width = parseFloat(d3.select(this).attr("width"));
                var xPosition = Math.floor(parseFloat(offsetVal) + (d3.event.x) - (d3.mouse(this)[0]) - hoverSvg.attr("x") + width / 2) + $(window).scrollLeft();
                var height = $("#" + mainSVGid).height();

                if (!geneClicked) {
                    hoverSvg.append('line')
                        .attr('id', 'geneHover')
                        .attr('x1', xPosition)
                        .attr('y1', 0)
                        .attr('x2', xPosition)
                        .attr('y2', height)
                        .attr('stroke', '#6D7ADB')
                        .attr('stroke-width', width + 1)
                        .attr('opacity', '0.5');
                    geneClicked = true;
                } else {
                    $("#geneHover").remove();
                    geneClicked = false;
                }
            })
            .on("contextmenu", function(d, i) {
                var position = d3.mouse(this);
                $("#context-menu-modal").css({
                    position: "absolute",
                    left: d3.event.x + "px",
                    top: +d3.event.y + "px",
                    margin: 0,
                    width: "10%"
                });
                var html = "<ul style=\"list-style: none; padding: 0;\">";
                html += "<li onclick=\"alert();\"> Make ref Snp </li>";
                html += "<li> Open </li>";
                html += "</ul";
                $("#context-menu-body").html(html);
                $("#context-menu").modal("show");
                // d3.select('#context-menu')
                //   .style('position', 'absolute')
                //   .style('left', position[0] + "px")
                //   .style('top', position[1] + "px");

                d3.event.preventDefault();
                // alert("hello");
            });
    }

    if (plotType.toLowerCase().startsWith("leafnodes")) {
        element = d3.select("#" + plotId + "_leafNodes_plot");
        //console.log(element);
        element.selectAll("rect")
            .on("mouseover", function(d) {
                //Get this bar's x/y values, then augment for the tooltip
                var xPosition = d3.event.x + $(window).scrollLeft();
                var yPosition = d3.event.y + $(window).scrollTop();
                var text = d3.select(this).attr("id");
                //Update the tooltip position and value
                d3.select("#tooltip")
                    .style("left", xPosition)
                    .style("top", yPosition)
                    .style("width", "auto")
                    .select("#value")
                    .text(function(p) {
                        return text;
                    });

                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
                //Show a horizontal line
                var element = d3.select("#" + plotId + "_leafNodes_plot");
                var disp = parseFloat($(this).attr('y')) + 5;
                element.append("svg:line")
                    .attr("x1", 0)
                    .attr("x2", 1000)
                    .attr("y1", disp)
                    .attr("y2", disp)
                    .attr('class','leaf_lines')
                    .style("stroke", "rgb(189, 189, 189)");
            })
            .on("mouseout", function(d) {
                d3.select("#tooltip").classed("hidden", true);
                d3.select('.leaf_lines').remove();
            })
            .on("click", function(d) {
                // console.log(d3.mouse(d3.select("#" + mainSVGid)));
                var leftPlotId = ($($("#" + plotId + "_leafNodes_plot").closest('tr')[0].children[1]).attr("id"));
                var rightPlotId = ($($("#" + plotId + "_leafNodes_plot").closest('tr')[0].children[3].children[0]).attr("id"));

                var refId = d3.select(this).attr("id").split(" ")[0];
                data.refSnp = refId;
                $("#" + plotId + "_textRef").attr("value", refId);
                d3.select("#tooltip").classed("hidden", true);

                dataFunctions();
                drawLeafNodesPlot($("#" + plotId + "_leafNodes_plot").closest('table').attr('id'), data.leaf_nodes, data.allDistances, false, plotId, leftPlotId, rightPlotId);
                sizeAndFunctions([plotId]);
            });
    }

    // Bar chart tooltip
    if (plotType.toLowerCase().startsWith("barchart")) {
        element = d3.select("#" + plotId + "_barchart_plot");
        element.selectAll("rect")
            .on("mouseover", function(d) {
                //Get this bar's x/y values, then augment for the tooltip
                var xPosition = d3.event.x + $(window).scrollLeft();
                var yPosition = d3.event.y + $(window).scrollTop();
                var text = d3.select(this).attr("class");
                if(text=='block') return;
                else{
                    text = d3.select(this).attr("id");
                }
                //Update the tooltip position and value
                d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .style("width", "250px")
                    .select("#value")
                    .text(function(p) {
                        return text;
                    });

                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function(d) {
                d3.select("#tooltip").classed("hidden", true);
            })
            .on("click", function(d) {
                // reorderClustersByReferenceSnp(d.snp);
                //window.open("http://bioserver1.sign.a-star.edu.sg:9000/snp/" + d.snp);
            });
    }

    // Sankey plot tooltip
    // Bar chart tooltip
    if (plotType.toLowerCase().startsWith("sankey")) {
        element = d3.select("#" + plotId + "_sankey_plot");
        element.selectAll("rect")
            .on("mouseover", function(d) {
                //Get this bar's x/y values, then augment for the tooltip
                var xPosition = d3.event.x + $(window).scrollLeft();
                var yPosition = d3.event.y + $(window).scrollTop();
                var text = d3.select(this).attr("id");
                //Update the tooltip position and value
                d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .style("width", "250px")
                    .select("#value")
                    .text(function(p) {
                        return text;
                    });

                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function(d) {
                d3.select("#tooltip").classed("hidden", true);
            })
            .on("click", function(d) {
                // reorderClustersByReferenceSnp(d.snp);
                //window.open("http://bioserver1.sign.a-star.edu.sg:9000/snp/" + d.snp);
            });

        element.selectAll("path")
            .on("mouseover", function(d) {
                //Get this bar's x/y values, then augment for the tooltip
                var xPosition = d3.event.x + $(window).scrollLeft();
                var yPosition = d3.event.y + $(window).scrollTop();
                var text = d3.select(this).attr("id");
                //Update the tooltip position and value
                d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .style("width", "250px")
                    .select("#value")
                    .text(function(p) {
                        return 'Value : ' + text;
                    });
                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function(d) {
                d3.select("#tooltip").classed("hidden", true);
            })
            .on("click", function(d) {
                // reorderClustersByReferenceSnp(d.snp);
                //window.open("http://bioserver1.sign.a-star.edu.sg:9000/snp/" + d.snp);
            });
    }
}

// both for zoom and scaling
function zoomed(zoomLevel) {
    var scaleVal = zoomLevel == undefined ? (d3.event.scale) : zoomLevel;
    // for zooming
    if (scaleVal == 0.5 || scaleVal == 2) {
        scaleVal = Math.round(zoomLevel == undefined ? (d3.event.scale) : zoomLevel);
        var differenceRuler = data.endRuler - data.startRuler;
        var change = Math.floor(Math.pow(-1, scaleVal) * (differenceRuler) / Math.pow(2, scaleVal));
        if (data.startRuler + change < data.endRuler - change) {
            data.startRuler += change;
            data.endRuler -= change;
            $("#studyDataText").attr("value", data.gene.chr + ": " + data.startRuler + " - " + data.endRuler);
            if(zoomLevel == 0.5){
                getData(1);
                renderEverything();
            }else{
                renderEverything();
            }
            // console.log(data.eqtls.length);
            // if (data.eqtls.length > 0 && Object.keys(data.snps).length > 0 && data.ld.length > 0) {
            //     renderEverything();
            // }
            // else {
            //     alert("Maximum zoom level reached");
            //     zoomed(0.5);
            // }
        } else
            console.log("Maximum zoom level reached");
    }
}

// function dragSVG(direction){
//     var sign = 1;
//     if(direction == "left"){
//         sign = -1;
//     }
//     var shift = Math.round((data.endRuler - data.startRuler) / 5);
//     data.startRuler += sign*shift;
//     data.endRuler += sign*shift;
//     $("#studyDataText").attr("value", data.gene.chr + ": " + data.startRuler + " - " + data.endRuler);
//     // getData();
//     renderEverything();
// }

function exportFile(text){
    $('body').append('<svg width="1000" height="1000" id="print_svg" style="background:white;"></svg>');
    var height = 10;
    var total_width = 0;
    var width = $('#genomic_axis').width();
    $('.mainContent .plot').each(function(d){
        $(this).clone().attr('y', height).attr('x',10).appendTo($('#print_svg'));
        var parent_id = '#' + $(this).parent().parent().attr('id');
        $(parent_id + ' .rightSpace .plot').each(function(d){
            if(parent_id.substring(1,14) == 'mainLeafNodes'){
                total_width = width + parseFloat($(this).width()) + 30;
                $(this).clone().attr('y', height).attr('x', width + 20).appendTo($('#print_svg'));
            }else{
                $(this).clone().attr('y', height + 23).attr('x', width + 20).appendTo($('#print_svg'));
            }
        });
        height = height + parseFloat($(this).attr('height')) + 10;
    });
    if(total_width == 0){
        total_width = width + 170;
    }
    $('#print_svg').attr('height',height + 20);
    $('#print_svg').attr('width', total_width);

    var styleDefs = "";
    var svgDomElement = document.getElementById('print_svg');
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
        var rules = sheets[i].cssRules;
        for (var j = 0; j < rules.length; j++) {
            var rule = rules[j];
            if (rule.style) {
                var selectorText = rule.selectorText;
                var elems = svgDomElement.querySelectorAll(selectorText);

                if (elems.length) {
                    styleDefs += selectorText + " { " + rule.style.cssText + " }\n";
                }
            }
        }
    }

    var s = document.createElement('style');
    s.setAttribute('type', 'text/css');
    s.innerHTML = styleDefs;

    var defs = document.createElement('defs');
    defs.appendChild(s);
    svgDomElement.insertBefore(defs, svgDomElement.firstChild);

    var svg = document.querySelector( "#print_svg" );
    var svgData = new XMLSerializer().serializeToString( svg );

    var canvas = document.createElement( "canvas" );
    canvas.width = total_width;
    canvas.height = d3.select("#print_svg").attr("height");
    var ctx = canvas.getContext( "2d" );

    if(text == 'PNG' || text == 'PDF'){
        var dataUri = '';
        dataUri = 'data:image/svg+xml;base64,' + btoa(svgData);

        var img = document.createElement( "img" );

        img.onload = function() {
            ctx.drawImage( img, 0, 0 );

            try {
                if(text == 'PNG'){
                    // Try to initiate a download of the image
                    var a = document.createElement("a");
                    a.download = "LdCLusterView.png";
                    a.href = canvas.toDataURL("image/png");
                    document.querySelector("body").appendChild(a);
                    a.click();
                    document.querySelector("body").removeChild(a);
                }

                if(text == 'PDF'){

                    var imgData = canvas.toDataURL("image/png");

                    var imgWidth = 210;
                    var pageHeight = 295;
                    var imgHeight = canvas.height * imgWidth / canvas.width;

                    var doc = new jsPDF('p', 'mm');

                    if(imgHeight > pageHeight){
                        var width = doc.internal.pageSize.width;
                        var height = doc.internal.pageSize.height;
                        doc.addImage(imgData, 'PNG', 0, 0, width, height);
                    }else{
                        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                    }

                    doc.save('LdClusterView.pdf');
                }

            } catch (ex) {

                // If downloading not possible (as in IE due to canvas.toDataURL() security issue)
                // then display image for saving via right-click

                var imgPreview = document.createElement("div");
                imgPreview.appendChild(img);
                document.querySelector("body").appendChild(imgPreview);

            }
        };

        img.src = dataUri;
    }

    if(text == 'SVG') {
        var svg = document.querySelector("#print_svg");
        var svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
        var svgUrl = URL.createObjectURL(svgBlob);
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "LdCLusterView.svg";
        downloadLink.click();
    }

    $('#print_svg').remove();
}
