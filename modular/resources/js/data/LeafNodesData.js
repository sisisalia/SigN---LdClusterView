function updateLeafNodesData(){

    if(this.original_snps == null){
        this.original_snps = jQuery.extend({}, this.snps);
        this.original_ld = jQuery.extend([], this.ld);
    }
    else{
        this.snps = jQuery.extend({}, this.original_snps);
        this.ld = jQuery.extend([], this.original_ld);
    }

    var tempSnps = {};

    for(var obj in this.original_snps){
        if(this.original_snps[obj].pos >= this.startRuler && this.original_snps[obj].pos <= this.endRuler)
            tempSnps[obj] = this.original_snps[obj];
    }

    this.snps = tempSnps;

    var snps = this.snps;
    this.ld = this.ld.filter(function(d){
        return (d[0] in snps) && (d[1] in snps);
    });

        // else if(data.)
    this.snp_r2 = {};
    for (var snp1 in this.snps) {
        this.snp_r2[snp1] = {};
        for (this.snp2 in this.snps) {
            this.snp_r2[snp1][this.snp2] = 1;
        }
    }

    // set the value from the LD calculations
    for (var i = 0; i < this.ld.length; i++) {
        this.snp_r2[this.ld[i][0]][this.ld[i][1]] = 1 - this.ld[i][2];
        this.snp_r2[this.ld[i][1]][this.ld[i][0]] = 1 - this.ld[i][2];
    }

    // cluster the snps
    this.snp_hc = this.hclust(this.snp_r2);

    // generate the snp order
    this.snp_order = $.map(this.snps, function(snp, id) { return id; });
    this.snp_order.sort(function(a, b) {
        if (snps[a].pos < snps[b].pos) {
            return -1;
        }
        else {
            return 1;
        }
    });

    this.distance_cutoff = this.ld_distance;
    this.dendrogram = this.computeDendrogram(this.distance_cutoff);
    this.allDistances = this.computeDistance();
}