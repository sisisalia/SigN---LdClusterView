// Scatter plot for spearman
// x_data and y_data should already removed NA
function scatterPlotNumerical(spearman_result, x_data, y_data, x_name, y_name, id, id_tooltip) {
    var margin = {top: 20, right: 70, bottom: 30, left: 50},
        width = 700 - margin.left - margin.right,
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

    var svg = d3.select(id).append("svg")
        .attr('id','spearman-scatter-plot')
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
    var tooltip = d3.select(id_tooltip).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // tooltip mouseover event handler
    var tipMouseover = function(d) {
        var html  = '<span>x : </span>' + d.x + '<br/><span>y : </span>' + d.y;

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .style("opacity", .9) // started as 0!

    };
    // tooltip mouseout event handler
    var tipMouseout = function(d) {
        tooltip.style("opacity", 0); // don't care about position!
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

    var regression_data = regression(x_data,y_data);

    var line = d3.svg.line()
        .x(function(d) {
            return x(d.x);
        })
        .y(function(d) {
            return y(d.yhat);
        });

    // tooltip mouseover event handler
    var lineMouseOver = function(d) {
        var html  = '<span>rho : </span>' + spearman_result.rho + '<br/><span>rho2 : </span>' + spearman_result.rho2;

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .style("opacity", .9) // started as 0!

    };

    svg.append("path")
        .datum(regression_data)
        .attr("class", "spearman_corr_line")
        .style("stroke", "black")
        .on("mouseover", lineMouseOver)
        .on("mouseout", tipMouseout)
        .attr("d", line);

    svg.append("text")
        .attr("x", 150)
        .attr("y", -10)
        .attr("dy", ".35em")
        .attr('font-weight', 'bold')
        .text('p-value : ' + spearman_result.pvalue);

    svg.append("text")
        .attr("x", 350)
        .attr("y", -10)
        .attr("dy", ".35em")
        .attr('font-weight', 'bold')
        .text('adj-pvalue : ' + spearman_result.pvalue_adj);
}

// Regression function
function regression(x_data,y_data) {
    var x = x_data;
    var y = y_data;
    var n = x_data.length;
    var x_mean = 0;
    var y_mean = 0;
    var term1 = 0;
    var term2 = 0;
    // calculate mean x and y
    x_mean /= n;
    y_mean /= n;
    // calculate coefficients
    var xr = 0;
    var yr = 0;
    for (i = 0; i < x.length; i++) {
        xr = x[i] - x_mean;
        yr = y[i] - y_mean;
        term1 += xr * yr;
        term2 += xr * xr;

    }
    var b1 = term1 / term2;
    var b0 = y_mean - (b1 * x_mean);
    // perform regression
    yhat = [];
    // fit line using coeffs
    for (i = 0; i < x.length; i++) {
        yhat.push(b0 + (x[i] * b1));
    }
    var data = [];
    for (i = 0; i < y.length; i++) {
        data.push({
            "yhat": yhat[i],
            "y": y[i],
            "x": x[i]
        })
    }
    return (data);
}

// Scatter plot for kruskal wallis
// x_data and y_data has been cleaned from NA
function scatterPlotCategorical(kruskal_result, x_data, y_data, x_name, y_name,id, id_tooltip){
    var margin = {top: 50, right: 70, bottom: 30, left: 50},
        width = 900 - margin.left - margin.right,
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

    var store_count = [];
    var data = [];
    for(var i = 0; i < x_data.length; i++){
        var temp = 0;
        var obj = {};
        obj.x = x(x_data[i]);
        obj.x_name = x_data[i];
        obj.y = y_data[i];
        data.push(obj);
        for(var j = 0; j < store_count.length; j++){
            if(store_count[j].x == x_data[i]){
                if(store_count[j].y == y_data[i]){
                    store_count[j].count++;
                    if(store_count[j].count == 1){
                        obj.x = x(x_data[i]) + store_count[j].count * 7;
                        temp = 1;
                        continue;
                    }
                    if(store_count[j].count % 2 == 1) {
                        obj.x = x(x_data[i]) + store_count[j].count * 4;
                    }else{
                        obj.x = x(x_data[i]) + store_count[j].count * -4;
                    }
                    temp = 1;
                }
            }
        }
        if(temp == 0) {
            var temp_obj = {};
            temp_obj.x = x_data[i];
            temp_obj.y = y_data[i];
            temp_obj.count = 0;
            store_count.push(temp_obj);
        }
    }

    y.domain([min_y,max_y]);

    var svg = d3.select(id).append("svg")
        .attr('id','kruskal-scatter-plot')
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
    var tooltip = d3.select(id_tooltip).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // tooltip mouseover event handler
    var tipMouseover = function(d) {

        var html  = '<span>x : </span>' + d.x_name + '<br/><span>y : </span>' + d.y;

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .style("opacity", .9) // started as 0!

    };
    // tooltip mouseout event handler
    var tipMouseout = function(d) {
        tooltip.style("opacity", 0); // don't care about position!
    };

    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function (d) {
            return d.x;
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
    }
    svg.append("text")
        .attr("x", 250)
        .attr("y", -10)
        .attr("dy", ".35em")
        .attr('font-weight', 'bold')
        .text('p-value : ' + kruskal_result.pvalue);

    svg.append("text")
        .attr("x", 450)
        .attr("y", -10)
        .attr("dy", ".35em")
        .attr('font-weight', 'bold')
        .text('adj-pvalue : ' + kruskal_result.pvalue_adj);

}

// Input : Two arrays of x and y
// Output : An object with keys : observed, expected
// To get observed and expected value to plot the table when rows in chi table is clicked
function getChiOETable(x,y){
    removeNA(x,y);
    var result = [];
    // transform the categorical value to count data table
    var obj = {};
    obj = transfromToCountData(x,y);
    // find row total and column total
    var row_total = [];
    var column_total = [];
    var all_total = 0;
    // row total
    for(var i = 0; i < Object.keys(obj).length; i++){
        var key_x = Object.keys(obj)[i];
        var total = 0;
        for(var j = 0; j < Object.keys(obj[key_x]).length; j++){
            var key_y = Object.keys(obj[key_x])[j];
            total += obj[key_x][key_y];
        }
        all_total += total;
        row_total.push(total);
    }
    // column total
    var column_titles = [];
    for(var i = 0; i < Object.keys(obj).length; i++){
        var key_x = Object.keys(obj)[i];
        column_titles = Object.keys(obj[key_x]);
        break;
    }
    for(var i = 0; i < column_titles.length; i++){
        var total = 0;
        var key_y = column_titles[i];
        for(var j = 0; j < Object.keys(obj).length; j++){
            var key_x = Object.keys(obj)[j];
            total += obj[key_x][key_y];
        }
        column_total.push(total);
    }
    // count the expected frequency count
    var exp = jQuery.extend(true, {}, obj);
    // using same data structure as obj
    for(var i = 0; i < Object.keys(exp).length; i++){
        var key_x = Object.keys(exp)[i];
        for(var j = 0; j < Object.keys(exp[key_x]).length; j++){
            var key_y = Object.keys(exp[key_x])[j];
            exp[key_x][key_y] = row_total[i] * column_total[j] / all_total;
        }
    }
    for(var i = 0; i < Object.keys(obj).length; i++){
        var key = Object.keys(obj)[i];
        var temp = {};
        temp['xxx'] = key;
        for(var j = 0; j < Object.keys(obj[key]).length; j++){
            var key2 = Object.keys(obj[key])[j];
            var observed = obj[key][key2];
            var expected = exp[key][key2];
            var oe = observed/expected;
            observed = observed.toPrecision(4);
            expected = expected.toPrecision(4);
            oe = oe.toPrecision(4);
            temp[key2] = observed + '/' + expected + '(' + oe + ')';
        }
        result.push(temp);
    }
    return result;
}