refSnp = null;
var ld;
var snps;

function updateLeafNodesData(update){
    ld_snps = ajaxCall('/ldcluster2/ld/'+ chr + '/' + startRuler + '/' + endRuler + '/' + population);
    ld = ld_snps.ld;
    snps = ld_snps.snps;

    // else if(data.)
    snp_r2 = {};
    for (snp1 in snps) {
        snp_r2[snp1] = {};
        for (snp2 in snps) {
            snp_r2[snp1][snp2] = 1;
        }
    }

    // set the value from the LD calculations
    for (var i = 0; i < ld.length; i++) {
        snp_r2[ld[i][0]][ld[i][1]] = 1 - ld[i][2];
        snp_r2[ld[i][1]][ld[i][0]] = 1 - ld[i][2];
    }

    // cluster the snps
    snp_hc = hclust(snp_r2);
    // generate the snp order
    snp_order = $.map(snps, function(snp, id) { return id; });
    snp_order.sort(function(a, b) {
        // seems the same as the code below, sort in ascending order of snp according to its position
        // return (data.snps[a].pos - data.snps[b].pos);
        if (snps[a].pos < snps[b].pos) {
            return -1;
        }
        else {
            return 1;
        }
    });

    distance_cutoff = ld_distance;
    dendrogram = computeDendrogram(distance_cutoff);
    allDistances = computeDistance();
}