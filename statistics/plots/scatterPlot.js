function scatterPlotNumerical(spearman_result, x_data, y_data, x_name, y_name) {
    var margin = {top: 20, right: 40, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // find minimum of x and y, cannot assume start from 0
    var min_x = 999999;
    var min_y = 999999;
    var max_x = -10000;
    var max_y = -10000;

    for(var i = 0; i < x_data.length; i++){
        if(min_x > Number(x_data[i])) min_x = x_data[i];
        if(min_y > Number(y_data[i])) min_y = y_data[i];
        if(max_x < Number(x_data[i])) max_x = x_data[i];
        if(max_y < Number(y_data[i])) max_y = y_data[i];
    }

    if(min_x > 0) min_x = 0;
    if(min_y > 0) {
        min_y = 0;
    }

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var data = [];
    for(var i = 0; i < x_data.length; i++){
        var obj = {};
        obj.x = x_data[i];
        obj.y = y_data[i];
        data.push(obj);
    }

    data.forEach(function (d) {
        d.x = +d.x;
        d.y = +d.y;
    });

    y.domain([min_y,max_y]);
    x.domain([min_x,max_x]);

    var svg = d3.select("#spearman-body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text(x_name);

    svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(y_name);

    // Add tooltip
    var tooltip = d3.select("#tooltip-container").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // tooltip mouseover event handler
    var tipMouseover = function(d) {
        var html  = '<span>x : </span>' + d.x + '<br/><span>y : </span>' + d.y;

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition()
            .duration(200) // ms
            .style("opacity", .9) // started as 0!

    };
    // tooltip mouseout event handler
    var tipMouseout = function(d) {
        tooltip.transition()
            .duration(300) // ms
            .style("opacity", 0); // don't care about position!
    };

    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function (d) {
            return x(d.x);
        })
        .attr("cy", function (d) {
            return y(d.y);
        })
        .style("fill", function (d) {
            return 'red';
        })
        .on("mouseover", tipMouseover)
        .on("mouseout", tipMouseout);

    var x_median = median(x_data);
    var y_median = median(y_data);
    var c = y_median - (spearman_result.rho * x_median);
    var y1 = c;
    var y2 = spearman_result.rho * max_x + c;

    // tooltip mouseover event handler
    var lineMouseOver = function(d) {
        var html  = '<span>rho : </span>' + spearman_result.rho + '<br/><span>rho2 : </span>' + spearman_result.rho2;

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition()
            .duration(200) // ms
            .style("opacity", .9) // started as 0!

    };

    svg.append("line")
        .attr('class','spearman_corr_line')
        .style("stroke", "black")
        .attr("x1", x(0))
        .attr("y1", y(y1))
        .attr("x2", x(max_x))
        .attr("y2", y(y2))
        .on("mouseover", lineMouseOver)
        .on("mouseout", tipMouseout);

    svg.append("text")
        .attr("x", width/6)
        .attr("y", -15)
        .attr("dy", ".35em")
        .attr('font-weight', 'bold')
        .text('p-value : ' + spearman_result.pvalue);
}

function median(x){
    var sort_x = x.slice(0);
    sort_x.sort(function(a, b){return a-b});
    for(var i = 0; i < sort_x.length; i++){
        if(sort_x[i] == null || sort_x[i] == ''){
            sort_x.splice(i,1);
        }
    }
    var val = x.length/2;
    if(x.length % 2 == 1){
        val = Math.floor(val);
        return sort_x[val];
    }else{
        var val1 = sort_x[val];
        var val2 = sort_x[val - 1];
        return (Number(val1) + Number(val2))/2;
    }
}

function scatterPlotCategorical(kruskal_result, x_data, y_data, x_name, y_name){
    var margin = {top: 50, right: 40, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // find minimum of x and y, cannot assume start from 0
    var min_x = 999999;
    var min_y = 999999;
    var max_x = -10000;
    var max_y = -10000;

    for(var i = 0; i < x_data.length; i++){
        if(min_x > Number(x_data[i])) min_x = x_data[i];
        if(min_y > Number(y_data[i])) min_y = y_data[i];
        if(max_x < Number(x_data[i])) max_x = x_data[i];
        if(max_y < Number(y_data[i])) max_y = y_data[i];
    }

    if(min_x > 0) min_x = 0;
    if(min_y > 0) {
        min_y = 0;
    }

    var x_temp = [' '];
    for(var i = 0; i < x_data.length; i++){
        x_temp.push(x_data[i]);
    }
    x_temp.push('');

    var x = d3.scale.ordinal()
        .domain(x_temp)
        .rangePoints([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var data = [];
    for(var i = 0; i < x_data.length; i++){
        var obj = {};
        obj.x = x_data[i];
        obj.y = y_data[i];
        data.push(obj);
    }

    y.domain([min_y,max_y]);

    var svg = d3.select("#kruskal-graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text(x_name);

     svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(y_name);

    // Add tooltip
    var tooltip = d3.select("#tooltip-container").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // tooltip mouseover event handler
    var tipMouseover = function(d) {
        var html  = '<span>x : </span>' + d.x + '<br/><span>y : </span>' + d.y;

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition()
            .duration(200) // ms
            .style("opacity", .9) // started as 0!

    };
    // tooltip mouseout event handler
    var tipMouseout = function(d) {
        tooltip.transition()
            .duration(300) // ms
            .style("opacity", 0); // don't care about position!
    };

    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function (d) {
            return x(d.x);
        })
        .attr("cy", function (d) {
            return y(d.y);
        })
        .style("fill", function (d) {
            return 'red';
        })
        .on("mouseover", tipMouseover)
        .on("mouseout", tipMouseout);

    // Add median line for each group
    var group = [];
    var group_obj = {};
    for(var i = 0; i < x_data.length; i++){
        var index = group.indexOf(x_data[i]);
        if(index == -1){
            group.push(x_data[i]);
            group_obj[x_data[i]] = [y_data[i]];
        }else{
            group_obj[x_data[i]].push(y_data[i]);
        }
    }

    // tooltip mouseover event handler
    var lineMouseOver = function(d) {
        var html  = '<span>median : </span>' + median_value;

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition()
            .duration(200) // ms
            .style("opacity", .9) // started as 0!

    };

    for(var i = 0; i < Object.keys(group_obj).length; i++){
        var key = Object.keys(group_obj)[i];
        var median_value = median(group_obj[key]);
        svg.append("line")
            .style("stroke", "black")
            .attr("x1", x(key) - 20)
            .attr("y1", y(median_value))
            .attr("x2", x(key) + 20)
            .attr("y2", y(median_value))
            .on("mouseover", lineMouseOver)
            .on("mouseout", tipMouseout);

        svg.append("text")
            .attr("x", width/6)
            .attr("y", -15)
            .attr("dy", ".35em")
            .attr('font-weight', 'bold')
            .text('p-value : ' + kruskal_result.pvalue);
    }
}