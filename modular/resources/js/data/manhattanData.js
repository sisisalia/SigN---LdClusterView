// filter the eqtls for the SNPs which are present
var eqtls = $.map(data.eqtls, function(eqtl, i) {
  if (data.snps[eqtl.snp]!=undefined) {
    return eqtl;
  }
});
// find the minimum non-zero p
var min_p = Math.min.apply(null, $.map(eqtls, function(e, i) {
  if (e.p != 0) {
    return e.p;
  }
}));
// process the eqtls for the p value and display text
var eqtl_studies = {}; // variable to hold the eqtl data grouped by studies
eqtls = $.map(eqtls, function(e, i) {
  if (e.p == 0) {
    e.neglog10p = -Math.log10(min_p);
  }
  else {
    e.neglog10p = -Math.log10(e.p);
  }
  e.neglog10p_unit = 1 - (e.neglog10p / -Math.log10(min_p));
  e.displayText = e.snp + " " + e.dataset + " " + e.description + " P=" + e.p + " FDR=" + e.fdr;
  var studyName = e.dataset + " " + e.description;
  if (!eqtl_studies.hasOwnProperty(studyName)) {
    eqtl_studies[studyName] = [];
  }
  eqtl_studies[studyName].push(e);
  return e;
});
// sort the eqtl studies by the best P values and compute the unit -log10 P
for (study in eqtl_studies) {
  eqtl_studies[study].sort( function(a, b) { return a.p < b.p ? -1 : 1 } );
  // this will allow showing the difference between each manhattanPlot eqtls
  eqtl_studies[study] = $.map(eqtl_studies[study], function(e, i) {
    // this always produce 0, so why?
    // index 0 is because is the smallest
    e.neglog10p_unit = 1 - (e.neglog10p / eqtl_studies[study][0].neglog10p);
    return e;
  });
}

eqtl_study_order = Object.keys(eqtl_studies);
eqtl_study_order.sort( function(a, b) { return eqtl_studies[a][0].p < eqtl_studies[b][0].p ? -1 : 1 } );
