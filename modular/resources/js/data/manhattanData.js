var eqtls;
var eqtls_result = {};
var eqtl_study_order;
var eqtl_studies;

function updateManhattanData(){
    eqtls = ajaxCall('/ldcluster2/eqtls/' + geneid);
    var ld_snps = ajaxCall('/ldcluster2/ld/'+ chr + '/' + startRuler + '/' + endRuler + '/' + population);
    var ld = ld_snps.ld;
    var snps = ld_snps.snps;

    eqtls_result = {};
    eqtl_study_order;
    eqtl_studies;

    min_p = 99999;

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
        var key = Object.keys(eqtls_result)[i];
        var eqtl = eqtls_result[key];
        for (var j = 0; j < eqtl.length; j++) {
            eqtl[j].bp = snps[eqtl[j].snp].pos;
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
}