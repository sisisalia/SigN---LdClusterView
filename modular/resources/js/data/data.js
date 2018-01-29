// get data from the session storage submitted by the user
population_choice = sessionStorage.getItem('population_choice');
gene_choice = sessionStorage.getItem('gene_choice');
gene_optional = sessionStorage.getItem('gene_optional');

var gene;
var geneid;
var eqtls;
var startRuler;
var endRuler;
var chr;
var ld_snps;
var ld;
var snps;
var methylation_data;

// get gene
gene = ajaxCall('/gene/symbol/hg19_gencode24/' + gene_choice);
// if the gene contains more than one sub-gene, get the one chosen by the user
if(Object.keys(gene).length != 1){
    geneid = gene_optional;
}else{
    geneid= Object.keys(gene)[0];
}

// get eqtls
eqtls = ajaxCall('/ldcluster2/eqtls/' + geneid);

// This will allow the display of the gene has some spaces on both sides
if(!startRuler){
    startRuler = gene[geneid].start - 5000;
}

if(!endRuler){
    endRuler = gene[geneid].end + 5000;
}

chr = gene[geneid].chr;
gene = gene[geneid];

// get ld and snps
ld_snps = ajaxCall('/ldcluster2/ld/'+ chr + '/' + startRuler + '/' + endRuler + '/' + population_choice);
ld = ld_snps.ld;
snps = ld_snps.snps;

// get methylation data
methylation_data = ajaxCall('/ldcluster2/methylation/' + chr + '/' + startRuler + '/' + endRuler);

// compile a JSON data called data
data = {};
data['symbol'] = gene_choice;
data['windowSize'] = 1400;
data['population'] = population_choice;
data['refSnp'] = null;
data['gene'] = gene;
data['snps'] = snps;
data['ld'] = ld;
data['eqtls'] = eqtls;
// cur_startRuler = data.startRuler;
// cur_endRuler = data.endRuler;
// save_data = {};