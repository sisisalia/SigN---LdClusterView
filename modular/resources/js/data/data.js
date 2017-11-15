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

gene = ajaxCall('/gene/symbol/hg19_gencode24/' + gene_choice);
if(Object.keys(gene).length != 1){
    geneid = gene_optional;
}else{
    geneid= Object.keys(gene)[0];
}

eqtls = ajaxCall('/ldcluster2/eqtls/' + geneid);

if(!startRuler){
    startRuler = gene[geneid].start - 5000;
}

if(!endRuler){
    endRuler = gene[geneid].end + 5000;
}

chr = gene[geneid].chr;
gene = gene[geneid];

ld_snps = ajaxCall('/ldcluster2/ld/'+ chr + '/' + startRuler + '/' + endRuler + '/' + population_choice);
ld = ld_snps.ld;
snps = ld_snps.snps;

methylation_data = ajaxCall('/ldcluster2/methylation/' + chr + '/' + startRuler + '/' + endRuler);

genes_data = $.map(gene.transcripts, function (transcript, id) {
    transcript.displayText = id;
    transcript.id = id;
    transcript.gene = gene.symbol;
    transcript.strand = gene.strand;
    return transcript;
});
genes_data = $.map(genes_data, function (transcript, i) {
    transcript.ypos = i / genes_data.length;
    return transcript;
});

data = {};
data['symbol'] = gene_choice;
data['windowSize'] = 1000;
data['population'] = population_choice;
data['refSnp'] = null;
data['gene'] = gene;
data['snps'] = snps;
data['ld'] = ld;
data['eqtls'] = eqtls;