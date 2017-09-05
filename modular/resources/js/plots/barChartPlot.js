function drawBarChartPlot(table, methyl_data, newRow, leftPlotId, rightPlotId, plotId, selected_probe){
  if(newRow){
      insertRow(table, leftPlotId, plotId, rightPlotId, false, false);
      $("#" + leftPlotId).empty();
      $("#" + rightPlotId).empty();
      $("#" + plotId).empty();
  }

  var html = '<div class="mainBar_title" style="text-align:center; border:1px solid black;">'+ selected_probe +'</div>';
  $("#" + plotId + "_td").append(html);

  var html = "<svg class=\"plot\" id=\"" + plotId + "\"></svg>";
  $("#" + plotId + "_td").append(html);

  var start = data.startRuler - 100;
  var end = data.endRuler + 100;
  var height = newRow ? 200 : $("#" + plotId).closest('svg').attr("height");
  var width = $("#" + plotId).width();

  var target = d3.select("#" + plotId).append("g").attr("id", plotId + "_barchart_plot");

  var probes = methyl_data[selected_probe].probes;

  var probes_size = Object.keys(probes).length;

  for(var i = 0; i < probes_size; i++){
    var probe = probes[Object.keys(probes)[i]];
    target.append("rect")
        .attr("x", function(d){
          return (probe.position - start) / (end - start) * width;
        })
        .attr("y", function(d){
          return (1-probe.average_beta) * (height - 60) + 8;
        })
        .attr("width", function(d){
          return 1;
        })
        .attr("height", function(d){
          return probe.average_beta * (height - 70);
        })
        .attr('id', function(d){
          var text = 'Probe:' + Object.keys(probes)[i] + ' Position:' + probe.position + ' Average beta:' + probe.average_beta;
          return text;
        });
  }

  target.append("line")
      .attr("x1", function(d){
          return 0
      })
      .attr("x2", function(d){
          return width
      })
      .attr("y1", function(d){
          return height-70
      })
      .attr("y2", function(d){
          return height-70
      })
      .attr("transform", "translate(0, 10)")
      .attr("stroke", "#000000")
      .attr("stroke-width", 1.5);

  var heightOfPlot = $("#" + plotId + "_barchart_plot").get(0).getBBox().height + 10;

  var start = 1;
  var end = 0;

  html = "<svg class=\"plot\" id=\"" + rightPlotId + "\"></svg>";
  $("#" + rightPlotId + "_td").html(html);

  var axis = d3.svg.axis().scale(d3.scale.linear().range([0, height-70]).domain([start, end]).nice()).orient("right");
  d3.select("#" + rightPlotId).append("g").attr("id",  rightPlotId + "_axis").attr("transform", "translate(0, 10)").call(axis);
  d3.select("#" + rightPlotId).attr("transform", "translate(0,16.5)");
}
