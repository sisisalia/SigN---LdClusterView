function getData() {
	// convert the ld calculations into a dictionary object for clustering
	// initialize the r2 with distance of 1

	// if(data.original_snps == undefined){
	// 		// create jquery of data.original_sth
	//     data.original_snps = jQuery.extend({}, data.snps);
	//     data.original_eqtls = jQuery.extend([], data.eqtls);
	//     data.original_ld = jQuery.extend([], data.ld);
	//     data.original_gene = jQuery.extend({}, data.gene);
	// }
	// else{
	// 	// doesnt seem to be useful, and might actually doubled the previous record?
	// 		data.snps = jQuery.extend({}, data.original_snps);
	//     data.eqtls = jQuery.extend([], data.original_eqtls);
	//     data.ld = jQuery.extend([], data.original_ld);
	//     data.gene = jQuery.extend({}, data.original_gene);
	// }
	//
	// // will be back to here later
	// // called when the ruler move
	// // if on max or min alr
	// if(data.startRuler < data.minFetched || data.endRuler > data.maxFetched){
	// 	// ajax calls
	// 	data.minFetched = data.snps[data.snp_order[0]].pos;
	// 	data.maxFetched = data.snps[data.snp_order[data.snp_order.length - 1]].pos;
	// 	data.startRuler = data.snps[data.snp_order[0]].pos;
	// 	data.endRuler = data.snps[data.snp_order[data.snp_order.length - 1]].pos;
	// 	alert("fetching");
	// }
	// // if its not on max or min
	// else if(data.startRuler != data.minFetched || data.endRuler != data.maxFetched){
	// 	// must be in between ruler
	// 	// look okay without this though
	// 	data.eqtls = data.original_eqtls.filter(function(d){
	// 		return d.bp >= data.startRuler && d.bp <= data.endRuler;
	// 	});
	//
	// 	// data.gene = data.gene.filter(function(d){
	// 	// 	return d.start >= start && d.end <= end;
	// 	// })
	//
	// 	var tempSnps = {};
	//
	// 	for(var obj in data.original_snps){
	// 		if(data.original_snps[obj].pos >= data.startRuler && data.original_snps[obj].pos <= data.endRuler)
	// 			tempSnps[obj] = data.original_snps[obj];
	// 	}
	//
	// 	data.snps = tempSnps;
	//
	// 	// data.snps = data.snps.filter(function(d){
	// 	// 	return d.bp >= data.startRuler && d.bp <= data.endRuler;
	// 	// })
	//
	// 	data.ld = data.ld.filter(function(d){
	// 		return (d[0] in data.snps) && (d[1] in data.snps);
	// 	})
	// }
	//
	// // else if(data.)
	// data.r2 = {};
	// for (snp1 in data.snps) {
	// 	data.r2[snp1] = {};
	// 	for (snp2 in data.snps) {
	// 		data.r2[snp1][snp2] = 1;
	// 	}
	// }
	//
	// // set the value from the LD calculations
	// for (var i = 0; i < data.ld.length; i++) {
	// 	data.r2[data.ld[i][0]][data.ld[i][1]] = 1 - data.ld[i][2];
	// 	data.r2[data.ld[i][1]][data.ld[i][0]] = 1 - data.ld[i][2];
	// }
	//
	// // cluster the snps
	// data.hc = hclust(data.r2);
	// // generate the snp order
	// data.snp_order = $.map(data.snps, function(snp, id) { return id; });
	// data.snp_order.sort(function(a, b) {
	// 	// seems the same as the code below, sort in ascending order of snp according to its position
	// 	// return (data.snps[a].pos - data.snps[b].pos);
	// 	if (data.snps[a].pos < data.snps[b].pos) {
	// 		return -1;
	// 	}
	// 	else {
	// 		return 1;
	// 	}
	// });

	// // filter the eqtls for the SNPs which are present
	// data.eqtls = $.map(data.eqtls, function(eqtl, i) {
	// 	if (data.snps[eqtl.snp]!=undefined) {
	// 		return eqtl;
	// 	}
	// });
	// // find the minimum non-zero p
	// min_p = Math.min.apply(null, $.map(data.eqtls, function(e, i) {
	// 	if (e.p != 0) {
	// 		return e.p;
	// 	}
	// }));
	// // process the eqtls for the p value and display text
	// data.eqtl_studies = {}; // variable to hold the eqtl data grouped by studies
	// data.eqtls = $.map(data.eqtls, function(e, i) {
	// 	if (e.p == 0) {
	// 		e.neglog10p = -Math.log10(min_p);
	// 	}
	// 	else {
	// 		e.neglog10p = -Math.log10(e.p);
	// 	}
	// 	//e.neglog10p_unit = 1 - (e.neglog10p / -Math.log10(min_p));
	// 	e.displayText = e.snp + " " + e.dataset + " " + e.description + " P=" + e.p + " FDR=" + e.fdr;
	// 	var studyName = e.dataset + " " + e.description;
	// 	if (!data.eqtl_studies.hasOwnProperty(studyName)) {
	// 		data.eqtl_studies[studyName] = [];
	// 	}
	// 	data.eqtl_studies[studyName].push(e);
	// 	return e;
	// });
	// // sort the eqtl studies by the best P values and compute the unit -log10 P
	// for (study in data.eqtl_studies) {
	// 	data.eqtl_studies[study].sort( function(a, b) { return a.p < b.p ? -1 : 1 } );
	// 	// this will allow showing the difference between each manhattanPlot eqtls
	// 	data.eqtl_studies[study] = $.map(data.eqtl_studies[study], function(e, i) {
	// 		// this always produce 0, so why?
	// 		// index 0 is because is the smallest
	// 		e.neglog10p_unit = 1 - (e.neglog10p / data.eqtl_studies[study][0].neglog10p);
	// 		return e;
	// 	});
	// }
	//
	// data.eqtl_study_order = Object.keys(data.eqtl_studies);
	// data.eqtl_study_order.sort( function(a, b) { return data.eqtl_studies[a][0].p < data.eqtl_studies[b][0].p ? -1 : 1 } );
	// data.transcripts = $.map(data.gene.transcripts, function(transcript, id) { transcript.displayText = id; transcript.id = id; transcript.gene = data.gene.symbol; transcript.strand = data.gene.strand; return transcript;});
	// data.transcripts = $.map(data.transcripts, function(transcript, i) { transcript.ypos = i / data.transcripts.length; return transcript; });
	// if(data.minFetched == undefined){
  //       data.minFetched = data.snps[data.snp_order[0]].pos;
  //       data.maxFetched = data.snps[data.snp_order[data.snp_order.length - 1]].pos;
  //       data.startRuler = data.snps[data.snp_order[0]].pos;
  //       data.endRuler = data.snps[data.snp_order[data.snp_order.length - 1]].pos;
	// }
	//always 28, so why?
	var size = data.gene.chr.length + data.startRuler.toString().length + data.endRuler.toString().length + 7;

	// draw the figure
	var html = "<div id='plot_menu' style='position: relative;'>";
	// window size
			html += " Window size : <select id='window_size_select' onChange='changeSize();'>";
			html += $.map([600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, "Full Screen"], function(n, i) { return "<option value="+ n +">" + n + "</option>"; } ).join("");
			html += "</select>";
	// // selected study
	// html += " | Study : <select id='selected_study'>";
	// html += $.map(data.eqtl_study_order, function(n, i) {
	// 	return $.sprintf("<option value='%s'>%s (P=%0.3E)</option>", n, n, data.eqtl_studies[n][0].p);
	// });
	// html += "</select>";
	html += " | <input type=\"checkbox\" id=\"showHover\"> Show Hover </input>";
	html += " | <button type=\"button\" onclick=\"configureList();\" data-toggle=\"modal\" data-target=\"#configureModal\"> Configure Plots </button>"
	// html += "<div class=\"dropdown\" style=\"float: left;\"> | <button type=\"button\" data-toggle=\"modal\" data-target=\"#configureModal\"> Configure Plots </button></div>"
	html += " | <button type=\"button\" class=\"dropdown-toggle\" data-toggle=\"dropdown\"> Save Plot <span class=\"caret\"></span></button><div class=\"dropdown-menu\"> <button onclick='exportPNG()' style='cursor:auto;width:150px;margin:5px;text-align:center;'>PNG</button></div></div>"
	// html += " | <button type=\"button\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true" aria-expanded="false"> Action </button> <div class="dropdown-menu"> <a class="dropdown-item" href="#">Action</a> <a class="dropdown-item" href="#">Another action</a> <a class="dropdown-item" href="#">Something else here</a> <div class="dropdown-divider"></div><a class="dropdown-item" href="#">Separated link</a> </div>";
	html += "</p>";
	html += "<center>";
	html += "<input type='text' id='studyDataText' value='" + data.gene.chr + ": " + data.startRuler + " - " + data.endRuler + "' readonly class=\"ruler-point\" size=" + size + "></input>";
	// html += "<input type='text' value='" + data.startRuler + "' readonly class=\"ruler-point\"></input> <b> - </b> ";
	// html += "<input type='text' value='" + data.endRuler + "' readonly class=\"ruler-point\"></input></center>";
	$("#extraDetails").html(html);
	$("#window_size_select").val(1600);
}
