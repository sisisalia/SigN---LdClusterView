function getData(zoom) {

    //should only run when theres zoom out
    if(zoom == 1){
        ld_snps = ajaxCall('/ldcluster2/ld/'+ chr + '/' + data.startRuler + '/' + data.endRuler + '/' + population_choice);
        ld = ld_snps.ld;
        snps = ld_snps.snps;

        methylation_data = ajaxCall('/ldcluster2/methylation/' + chr + '/' + data.startRuler + '/' + data.endRuler);

        data['snps'] = snps;
        data['ld'] = ld;

        //exclude out sankey plot if it is not in the range
        //currently because data is not from database yet
        var probe_inside = 0;
        for(var i = 0; i < mqtls_raw.length; i++){
            if((mqtls_raw[i].probe_position <= endRuler)&&(mqtls_raw[i].probe_position >= startRuler)){
                probe_inside = 1;
            }
        }
        if((probe_inside != 0) && ($('.show_mainSankeyPlot').length == 0)){
            $('#invisible').append('<li class="show_mainSankeyPlot">Sankey Plot</li>');
        }
    }

	// else if(data.)
	data.r2 = {};
	for (snp1 in data.snps) {
		data.r2[snp1] = {};
		for (snp2 in data.snps) {
			data.r2[snp1][snp2] = 1;
		}
	}

	// set the value from the LD calculations
	for (var i = 0; i < data.ld.length; i++) {
		data.r2[data.ld[i][0]][data.ld[i][1]] = 1 - data.ld[i][2];
		data.r2[data.ld[i][1]][data.ld[i][0]] = 1 - data.ld[i][2];
	}

	// cluster the snps
	data.hc = hclust(data.r2);
	// generate the snp order
	data.snp_order = $.map(data.snps, function(snp, id) { return id; });
	data.snp_order.sort(function(a, b) {
		// seems the same as the code below, sort in ascending order of snp according to its position
		// return (data.snps[a].pos - data.snps[b].pos);
		if (data.snps[a].pos < data.snps[b].pos) {
			return -1;
		}
		else {
			return 1;
		}
	});

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

    // filter the eqtls for the SNPs which are present
    for (var i = 0; i < Object.keys(eqtls).length; i++) {
        var temp = [];
        var key = Object.keys(eqtls)[i];
        var eqtl = eqtls[key];
        for (var j = 0; j < eqtl.length; j++) {
            if (snps[eqtl[j].snp] != undefined) {
                temp.push(eqtl[j]);
            }
        }
        if (temp.length != 0) {
            eqtls_result[key] = temp;
        }
    }

// find min_p which is not 0
    for (var i = 0; i < Object.keys(eqtls_result).length; i++) {
        var key = Object.keys(eqtls_result)[i];
        var eqtl = eqtls_result[key];
        for (var j = 0; j < eqtl.length; j++) {
            var p_value = eqtl[j].p;
            if (p_value != 0) {
                if (min_p > p_value) {
                    min_p = p_value;
                }
            }
        }
    }

    for (var i = 0; i < Object.keys(eqtls_result).length; i++) {
        var temp = [];
        var key = Object.keys(eqtls_result)[i];
        var eqtl = eqtls_result[key];
        for (var j = 0; j < eqtl.length; j++) {
            eqtl[j].bp = snps[eqtl[j].snp].pos;
            if (snps[eqtl[j].snp] != undefined) {
                temp.push(eqtl[j]);
            }
            var p_value = eqtl[j].p;
            if (p_value == 0) {
                eqtl[j].neglog10p = -Math.log10(min_p);
            }
            else {
                eqtl[j].neglog10p = -Math.log10(p_value);
            }
            eqtl[j].neglog10p_unit = 1 - (eqtl[j].neglog10p / -Math.log10(min_p));
            eqtl[j].displayText = eqtl[j].snp + " P=" + eqtl[j].p + " FDR=" + eqtl[j].fdr + " Value= " + eqtl[j].neglog10p;
        }
    }

    eqtl_studies = eqtls_result;

// sort the eqtl studies by the best P values and compute the unit -log10 P
    for (study in eqtl_studies) {
        eqtl_studies[study].sort(function (a, b) {
            return a.p < b.p ? -1 : 1
        });
        // this will allow showing the difference between each manhattanPlot eqtls
        eqtl_studies[study] = $.map(eqtl_studies[study], function (e, i) {
            // this always produce 0, so why?
            // index 0 is because is the smallest
            e.neglog10p_unit = 1 - (e.neglog10p / eqtl_studies[study][0].neglog10p);
            return e;
        });
    }

    eqtl_study_order = Object.keys(eqtl_studies);
    eqtl_study_order.sort(function (a, b) {
        return eqtl_studies[a][0].p < eqtl_studies[b][0].p ? -1 : 1
    });

    data['eqtls'] = eqtls;
    data['eqtl_studies'] = eqtl_studies;
    data['eqtl_study_order'] = eqtl_study_order;

	data.transcripts = $.map(data.gene.transcripts, function(transcript, id) { transcript.displayText = id; transcript.id = id; transcript.gene = data.gene.symbol; transcript.strand = data.gene.strand; return transcript;});
	data.transcripts = $.map(data.transcripts, function(transcript, i) { transcript.ypos = i / data.transcripts.length; return transcript; });
	if(data.minFetched == undefined){
        data.minFetched = data.snps[data.snp_order[0]].pos;
        data.maxFetched = data.snps[data.snp_order[data.snp_order.length - 1]].pos;
        data.startRuler = data.snps[data.snp_order[0]].pos;
        data.endRuler = data.snps[data.snp_order[data.snp_order.length - 1]].pos;
	}
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
    html += " | <button type=\"button\" class=\"dropdown-toggle\" data-toggle=\"dropdown\"> Save Plot <span class=\"caret\"></span></button><div class=\"dropdown-menu\"> <button onclick='exportFile($(this).text())' style='cursor:auto;width:150px;margin:5px;text-align:center;'>PNG</button><br><button onclick='exportFile($(this).text())' style='cursor:auto;width:150px;margin:5px;text-align:center;'>PDF</button><br><button onclick='exportFile($(this).text())' style='cursor:auto;width:150px;margin:5px;text-align:center;'>SVG</button></div> | <a href='mainpage.html' id='back'> Back to Main Page</a> </div>"
	// html += " | <button type=\"button\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true" aria-expanded="false"> Action </button> <div class="dropdown-menu"> <a class="dropdown-item" href="#">Action</a> <a class="dropdown-item" href="#">Another action</a> <a class="dropdown-item" href="#">Something else here</a> <div class="dropdown-divider"></div><a class="dropdown-item" href="#">Separated link</a> </div>";
	html += "</p>";
	html += "<center>";
	html += "<input type='text' id='studyDataText' value='" + data.gene.chr + ": " + data.startRuler + " - " + data.endRuler + "' readonly class=\"ruler-point\" size=" + size + "></input>";
	// html += "<input type='text' value='" + data.startRuler + "' readonly class=\"ruler-point\"></input> <b> - </b> ";
	// html += "<input type='text' value='" + data.endRuler + "' readonly class=\"ruler-point\"></input></center>";
	$("#extraDetails").html(html);
	$("#window_size_select").val(1600);
}
