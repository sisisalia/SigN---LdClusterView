// if(data.original_snps == undefined){
//     // create jquery of data.original_sth
//     data.original_snps = jQuery.extend({}, data.snps);
//     data.original_eqtls = jQuery.extend([], data.eqtls);
//     data.original_ld = jQuery.extend([], data.ld);
//     data.original_gene = jQuery.extend({}, data.gene);
// }
// else{
//   // doesnt seem to be useful, and might actually doubled the previous record?
//     data.snps = jQuery.extend({}, data.original_snps);
//     data.eqtls = jQuery.extend([], data.original_eqtls);
//     data.ld = jQuery.extend([], data.original_ld);
//     data.gene = jQuery.extend({}, data.original_gene);
// }

//will be back to here later
//called when the ruler move
//if on max or min alr
if(data.startRuler < data.minFetched || data.endRuler > data.maxFetched){
  // ajax calls
  data.minFetched = data.snps[snp_order[0]].pos;
  data.maxFetched = data.snps[snp_order[snp_order.length - 1]].pos;
  data.startRuler = data.snps[snp_order[0]].pos;
  data.endRuler = data.snps[snp_order[snp_order.length - 1]].pos;
  console.log("fetching");
}
//if its not on max or min
else if(data.startRuler != data.minFetched || data.endRuler != data.maxFetched){
  // must be in between ruler
  // look okay without this though
  data.eqtls = data.original_eqtls.filter(function(d){
    return d.bp >= data.startRuler && d.bp <= data.endRuler;
  });

  // data.gene = data.gene.filter(function(d){
  // 	return d.start >= start && d.end <= end;
  // })

  var tempSnps = {};

  for(var obj in data.original_snps){
    if(data.original_snps[obj].pos >= data.startRuler && data.original_snps[obj].pos <= data.endRuler)
      tempSnps[obj] = data.original_snps[obj];
  }

  data.snps = tempSnps;

  // data.snps = data.snps.filter(function(d){
  // 	return d.bp >= data.startRuler && d.bp <= data.endRuler;
  // })

  data.ld = data.ld.filter(function(d){
    return (d[0] in data.snps) && (d[1] in data.snps);
  })
}

// else if(data.)
snp_r2 = {};
for (snp1 in data.snps) {
  snp_r2[snp1] = {};
  for (snp2 in data.snps) {
    snp_r2[snp1][snp2] = 1;
  }
}

// set the value from the LD calculations
for (var i = 0; i < data.ld.length; i++) {
  snp_r2[data.ld[i][0]][data.ld[i][1]] = 1 - data.ld[i][2];
  snp_r2[data.ld[i][1]][data.ld[i][0]] = 1 - data.ld[i][2];
}

// cluster the snps
snp_hc = hclust(snp_r2);
// generate the snp order
snp_order = $.map(data.snps, function(snp, id) { return id; });
snp_order.sort(function(a, b) {
  // seems the same as the code below, sort in ascending order of snp according to its position
  // return (data.snps[a].pos - data.snps[b].pos);
  if (data.snps[a].pos < data.snps[b].pos) {
    return -1;
  }
  else {
    return 1;
  }
});

if(data.minFetched == undefined){
      data.minFetched = data.snps[snp_order[0]].pos;
      data.maxFetched = data.snps[snp_order[snp_order.length - 1]].pos;
      data.startRuler = data.snps[snp_order[0]].pos;
      data.endRuler = data.snps[snp_order[snp_order.length - 1]].pos;
}
