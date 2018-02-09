// Input : an array of data
// Output : an object with keys : type, unique_n, n, missing_fraction, mean, median, min, max, sd, shapiro_wilk_normal_pvalue, use_as_numeric, use_as_categorical, num_min_count_group
function computeSummaryStatistics(x){
    var obj = {};
    if(!x.some(isNaN)) obj.type ='numerical';
    else obj.type = 'categorical';
    obj.missing_fraction = (missingFraction(x)).toPrecision(3);
    obj.n = Math.round(x.length - obj.missing_fraction * x.length);
    obj.unique_n = isUnique_n(x);
    if(obj.unique_n <= 10) {
        obj.used_as_categorical = 'yes';
        obj.used_as_numerical = 'no';
    }else{
        obj.used_as_categorical = 'no';
        obj.used_as_numerical = 'yes';
    }
    if(obj.used_as_categorical == 'yes'){
        obj.mean = 'NA';
        obj.median = 'NA';
        obj.min = 'NA';
        obj.max = 'NA';
        obj.sd = 'NA';
        obj.shapiro_wilk_normal_pvalue = "NA";
        obj.num_min_count_group = countCategoricalGroup(x);
        return obj;
    }else{
        obj.mean = mean(x).toPrecision(3);
        obj.median = median(x);
        obj.min = min(x);
        obj.max = max(x);
        obj.sd = standardDeviation(x).toPrecision(3);
        obj.used_as_categorical = 'no';
        obj.used_as_numerical = 'yes';
        // Shapiro walk -> for sample size 3 - 2000
        // Check if the sample size is btwn 3 and 2000
        if(x.length < 3 && x.length > 2000){
            obj.shapiro_wilk_normal_pvalue = "NA";
            return obj;
        }else{
            var pw = ShapiroWilkW(x);
            // find p-value
            obj.shapiro_wilk_normal_pvalue = pw.toExponential(5);
            obj.num_min_count_group = "NA";
            return obj;
        }
    }
    return obj;
}

// Input : Two arrays of x and y
// Output : an object with keys ; rho, rho2, pvalue, n, perfect association
// spearman correlation algorithm
function corrSpearman(x,y){
    // remove NA
    removeNA(x,y);
    var x_update = x;
    var y_update = y;
    var result = {};
    var rho = jStat.spearmancoeff(x_update,y_update);
    result.rho = rho.toPrecision(3);
    result.rho2 = Math.pow(rho,2).toPrecision(3);
    var t_score = rho / Math.sqrt((1 - Math.pow(rho, 2)) / (x_update.length - 2));
    result.pvalue = (jStat.ttest(t_score, x_update.length - 1, 2)).toExponential(5);
    result.n = x_update.length;
    // If the rank of x and rank of y is equal, hence it is perfectly associated
    var rank_x = jStat.rank(x_update);
    var rank_y = jStat.rank(y_update);
    var corr = 1;
    for(var i = 0; i < rank_x.length; i++){
        if(rank_x[i] != rank_y[i]){
            corr = 0;
            break;
        }
    }
    if(corr == 1){
        result.perfect_association = 'yes';
    }else{
        result.perfect_association = 'no';
    }
    return result;
}

// Input : x must be array of categorical value and y is an array of numerical value
// Output : Object with keys; df, n, chisq, pvalue, perfect separation
function runKruskalWallisTest(x,y){
    // remove NA
    removeNA(x,y);
    var df = getDF(x);
    if(df == 0) return -1;
    var obj = transformToCategory(x,y);
    var array = y.slice(0);
    array.sort(function(a, b){return a-b});
    // Store data as key and an array of its rank as a value
    var comb_rank = {};
    for(var i = 0; i < array.length; i++){
        if(!comb_rank[array[i]]){
            comb_rank[array[i]] = [i+1];
        }else{
            comb_rank[array[i]].push(i+1);
        }
    }
    // Average out the rank if there is a tie
    // Also compute number of ties for one value for further adjustment in h_statistic
    var t_sum = 0;
    var tie = 0;
    for(var i = 0; i < Object.keys(comb_rank).length; i++){
        var key = Object.keys(comb_rank)[i];
        if(comb_rank[key].length != 1){
            tie = 1;
            t_sum += (Math.pow(comb_rank[key].length,3) - comb_rank[key].length);
            var mean_value = mean(comb_rank[key]);
            comb_rank[key] = [mean_value];
        }
    }
    // Check if the ranks in group is the same
    var rank_x = jStat.rank(x);
    var rank_y = jStat.rank(y);
    var corr = 1;
    for(var i = 0; i < rank_x.length; i++){
        if(rank_x[i] != rank_y[i]){
            corr = 0;
            break;
        }
    }
    if(corr == 1){
        var perfect_separation = 'yes';
    }else{
        var perfect_separation = 'no';
    }
    // Add up the different ranks for each group
    var total_ranks = [];
    var sample_size = [];
    for(var i = 0; i < Object.keys(obj).length; i++){
        var key = Object.keys(obj)[i];
        var total = 0;
        sample_size.push(obj[key].length);
        for(var j = 0; j < obj[key].length; j++){
            total += comb_rank[obj[key][j]][0];
        }
        total_ranks.push(total);
    }
    // Calculate the H statistic
    var total_len = array.length;
    var temp1 = 12/(total_len*(total_len + 1));
    var temp2 = 0;
    for(var i = 0; i < total_ranks.length; i++){
        temp2 += Math.pow(total_ranks[i],2)/sample_size[i];
    }
    var result = {};
    result.n = x.length;
    result.chisq = (temp1 * temp2) - (3*(total_len + 1));
    result.df = df;
    if(tie == 1) {
        result.chisq = result.chisq / (1 - (t_sum / (Math.pow(total_len, 3) - total_len)));
    }
    result.pvalue = (1 - jStat.chisquare.cdf(result.chisq,result.df)).toExponential(5);
    result.chisq = result.chisq.toPrecision(3);
    if(perfect_separation == 1){
        result.perfect_separation = 'yes';
    }else{
        result.perfect_separation = 'no';
    }
    return result;
}

// Input : x must be array of categorical value and y is an array of numerical value
// Output : Object with keys; group1, group2, pvalue, chisq, zvalue
function runKruskalWallisDunnPostHocTest(x,y){
    // remove NA
    removeNA(x,y);
    var obj = transformToCategory(x,y);
    var array = y.slice(0);
    array.sort(function(a, b){return a-b});
    // Store data as key and an array of its rank as a value
    var comb_rank = {};
    for(var i = 0; i < array.length; i++){
        if(!comb_rank[array[i]]){
            comb_rank[array[i]] = [i+1];
        }else{
            comb_rank[array[i]].push(i+1);
        }
    }
    // Average out the rank if there is a tie
    // Also compute number of ties for one value for further adjustment in h_statistic
    var t_sum = 0;
    var tie = 0;
    for(var i = 0; i < Object.keys(comb_rank).length; i++){
        var key = Object.keys(comb_rank)[i];
        if(comb_rank[key].length != 1){
            tie = 1;
            t_sum += (Math.pow(comb_rank[key].length,3) - comb_rank[key].length);
            var mean_value = mean(comb_rank[key]);
            comb_rank[key] = [mean_value];
        }
    }
    // Add up the different ranks for each group
    var total_ranks = [];
    var sample_size = [];
    for(var i = 0; i < Object.keys(obj).length; i++){
        var key = Object.keys(obj)[i];
        var total = 0;
        sample_size.push(obj[key].length);
        for(var j = 0; j < obj[key].length; j++){
            total += comb_rank[obj[key][j]][0];
        }
        total_ranks.push(total);
    }
    var per_group_average_rank = [];
    for(var i = 0; i < total_ranks.length; i++){
        per_group_average_rank.push(total_ranks[i]/sample_size[i]);
    }
    // calculate chi
    var total_len = array.length;
    var temp1 = 12/(total_len*(total_len + 1));
    var temp2 = 0;
    for(var i = 0; i < total_ranks.length; i++){
        temp2 += Math.pow(total_ranks[i],2)/sample_size[i];
    }
    var chisq = (temp1 * temp2) - (3*(total_len + 1));
    if(tie == 1) {
        chisq = chisq / (1 - (t_sum / (Math.pow(total_len, 3) - total_len)));
    }
    var z_statistics = [];
    // per combination of two groups
    for(var i = 0; i < Object.keys(obj).length; i++){
        var key1 = Object.keys(obj)[i];
        for (var j = i + 1; j < Object.keys(obj).length; j++){
            var key2 = Object.keys(obj)[j];
            var z_result = {};
            z_result.group1 = key1;
            z_result.group2 = key2;
            var temp1 = (x.length * (x.length + 1))/12;
            var temp2 = (t_sum / (12 * (x.length - 1)));
            var temp3 = (1/sample_size[i]) + (1/sample_size[j]);
            z_result.zvalue = ((per_group_average_rank[i] - per_group_average_rank[j])/Math.pow((temp1-temp2) * temp3,1/2)).toExponential(5);
            z_result.pvalue = (jStat.ztest(z_result.zvalue,2)).toExponential(5);
            z_result.chisq = chisq.toPrecision(3);
            z_statistics.push(z_result);
        }
    }
    return z_statistics;
}

// Input : two arrays, x and y
// Output : An object with keys : df, n, perfect_association, chisq, chisq_pvalue, cramer_v
// Pearson chi square
function runChisquareTest(x,y){
    removeNA(x,y);
    var result = {};
    result.df = getDF(x, y);
    if(result.df == 0) {
        return -1;
    };
    result.n = x.length;
    var corr = jStat.corrcoeff(x,y);
    if(corr == 1){
        result.perfect_association = 'yes';
    }else{
        result.perfect_association = 'no';
    }
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
    // // find chi square test statistics
    var chi = 0;
    for(var i = 0; i < Object.keys(exp).length; i++){
        var key_x = Object.keys(exp)[i];
        for(var j = 0; j < Object.keys(exp[key_x]).length; j++){
            var key_y = Object.keys(exp[key_x])[j];
            chi += Math.pow(obj[key_x][key_y] - exp[key_x][key_y],2)/exp[key_x][key_y];
        }
    }
    result.chisq = chi.toPrecision(3);
    result.chisq_pvalue = (1 - jStat.chisquare.cdf(result.chisq, result.df)).toExponential(5);
    if(row_total.length < column_total.length){
        var min = row_total.length - 1;
    }else{
        var min = column_total.length - 1;
    }
    result.cramer_v = Math.pow((result.chisq/result.n)/min,1/2).toPrecision(3);
    return result;
}

// Input : An array
// Output : A number
// This function will count how many groups which has more than 3 samples
// Only apply for categorical type
function countCategoricalGroup(x){
    var result = 0;
    var counter = 0;
    var groups = [];
    for(var i = 0; i < x.length; i++){
        if(x[i] == '' || x[i] == null) continue;
        var index = groups.indexOf(x[i]);
        if(index == -1){
            groups.push(x[i]);
        }
    }
    for(var i = 0; i < groups.length; i++){
        for(var j = 0; j < x.length; j++){
            if(x[j] == '' || x[j] == null) continue;
            if(x[j] == groups[i]){
                counter++;
            }
            if(counter >= 3){
                result++;
                break;
            }
        }
        counter = 0;
    }
    return result;
}

// Input : An array
// Output : A float
// Finding fraction of values which are 'NA' in the array
function missingFraction(x){
    var counter = 0;
    for(var i = 0; i < x.length; i++){
        if(x[i] == null || x[i] == '') {
            counter++;
        }
    }
    return counter/x.length;
}

// Input : An array
// Output : A number
// return a number to see how many items in array are unique
function isUnique_n(x){
    var groups = [];
    for(var i = 0; i < x.length; i++){
        if(x[i] == '' || x[i] == null) continue;
        var index = groups.indexOf(x[i]);
        if(index == -1){
            groups.push(x[i]);
        }
    }
    return groups.length;
}

// Input : Two arrays of x and y
// Output : An object which represent 2x2 table with count data as its value
function transfromToCountData(x,y){
    var group_x = [];
    var group_y = [];
    for(var i = 0; i < x.length; i++){
        var index = group_x.indexOf(x[i]);
        if(index == -1){
            group_x.push(x[i]);
        }
        var index = group_y.indexOf(y[i]);
        if(index == -1){
            group_y.push(y[i]);
        }
    }
    // form a json array of group_x
    // form another json array of group_y for each group_x
    var obj = {};
    for(var i = 0; i < group_x.length; i++){
        obj[group_x[i]] = {};
        for(var j = 0; j < group_y.length; j++){
            obj[group_x[i]][group_y[j]] = 0;
        }
    }
    /// count data
    for(var i = 0; i < x.length; i++){
        obj[x[i]][y[i]] += 1;
    }
    return obj;
}

// Taking mean where x is an array
function mean(x){
    var sum = 0;
    var missing  = 0;
    for(var i = 0; i < x.length; i++){
        if(x[i] == null || x[i] == '') {
            missing++;
            continue;
        }
        sum += parseFloat(x[i]);
    }
    return sum/(x.length - missing);
}

// Taking an array and count sd
function standardDeviation(x){
    var mean_x = mean(x);
    var sum = 0;
    var missing = 0;
    for(var i = 0; i < x.length; i++){
        if(x[i] == null|| x[i] == ''){
            missing++;
            continue;
        }
        var result = Math.pow(parseFloat(x[i]) - mean_x,2);
        sum += result;
    }
    return Math.sqrt(sum/(x.length - 1 - missing));
}

// Taking an array and return its median value
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

// Taking an array and finding minimum value
function min(x){
    var sort_x = x.slice(0);
    for(var i = 0; i < sort_x.length; i++){
        if(sort_x[i] == 'null' || sort_x[i] == ''){
            sort_x.splice(i,1);
            i--;
        }
    }
    sort_x.sort(function(a, b){return a-b});
    return Number(sort_x[0]);
}

// Taking an array and finding maximum value
function max(x){
    var sort_x = x.slice(0);
    sort_x.sort(function(a, b){return a-b});
    return Number(sort_x[x.length -1]);
}

// Taking an array and finding the summation of the array
function summation(x){
    var sum = 0;
    for(var i = 0; i < x.length; i++){
        sum += parseFloat(x[i]);
    }
    return sum;
}

// Input : Two arrays where x be category and y be numerical
// Output : An object which return x as key with its associated numerical number as an array
function transformToCategory(x,y){
    var group_x = [];
    var obj = {};
    for(var i = 0; i < x.length; i++){
        var index = group_x.indexOf(x[i]);
        if(index == -1){
            group_x.push(x[i]);
            obj[x[i]] = [y[i]];
        }else{
            obj[x[i]].push(y[i]);
        }
    }
    return obj;
}

// Finding degree of freedom given two arrays of x and y
function getDF(x,y){
    if(y) {
        var group_x = [];
        var group_y = [];
        for (var i = 0; i < x.length; i++) {
            var index = group_x.indexOf(x[i]);
            if (index == -1) {
                group_x.push(x[i]);
            }
            var index = group_y.indexOf(y[i]);
            if (index == -1) {
                group_y.push(y[i]);
            }
        }
        return (group_x.length - 1) * (group_y.length - 1);
    }else{
        var group_x = [];
        for (var i = 0; i < x.length; i++) {
            var index = group_x.indexOf(x[i]);
            if (index == -1) {
                group_x.push(x[i]);
            }
        }
        return (group_x.length - 1);
    }
}

// Remove NA, it is directly remove the arrays passed on the parameter
function removeNA(x,y) {
    //remove 'NA' record
    if(!x || !y) return;
    for(var i = 0; i < x.length; i++){
        if(x[i] == null || x[i] == ''){
            x.splice(i,1);
            y.splice(i,1);
            i--;
        }
    }
    for(var i = 0; i < y.length; i++){
        if(y[i] == null || y[i] == ''){
            y.splice(i,1);
            x.splice(i,1);
            i--;
        }
    }
    return;
}

// following R logic of adjusted p value
// return the json object with added adj p value
function addAdjPvalue(x,chi){
    var n = x.length;
    var result = Array(n);
    var temp_p_value = [];
    var array_p_value = [];
    for(var i = 0; i < x.length; i++){
        if(chi == 1){
            // console.log('CHI');
            var p_value = x[i].chisq_pvalue;
        }else{
            var p_value = x[i].pvalue;
        }
        array_p_value.push(p_value);
        // var index = temp_p_value.indexOf(p_value);
        // if(index == -1){
            temp_p_value.push(p_value);
        // }
    }
    // descending order
    temp_p_value.sort(function(a, b){return Number(b)-Number(a)});
    var o = [];
    for(var i = 0; i < temp_p_value.length; i++){
        var index = array_p_value.indexOf(temp_p_value[i]);
        // Prevent having same index, hence if same p value, it will increment
        while(o.indexOf(index) != -1){
            index++;
        }
        o.push(index);
    }
    var last_min;
    for(var i = 0; i < x.length; i++){
        if(chi == 1){
            var res = x.length/(x.length - i) * x[o[i]].chisq_pvalue;
        }else{
            var res = x.length/(x.length - i) * x[o[i]].pvalue;
        }
        if(res > 1){
            res = 1;
        }
        if(!last_min) last_min = res;
        if(res > last_min){
            res = last_min;
        }
        result[o[i]] = res;
    }
    // console.log(x.length);
    // console.log(result);
    for(var i = 0; i < result.length; i++){
        if(!result[i] && result[i] != 0) console.log('result undefined');
    }
    for(var i = 0; i < x.length; i++){
        x[i].pvalue_adj = result[i];
    }
    // console.log(x);
    return x;
}
