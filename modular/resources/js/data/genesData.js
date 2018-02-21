// get data from the session storage submitted by the user
population = sessionStorage.getItem('population_choice');
symbol = sessionStorage.getItem('gene_choice');
gene_optional = sessionStorage.getItem('gene_optional');

// initialized
var gene;
var geneid;
var startRuler;
var endRuler;
var chr;

// get gene
gene = ajaxCall('/gene/symbol/hg19_gencode24/' + symbol);
// if the gene contains more than one sub-gene, get the one chosen by the user
if(Object.keys(gene).length != 1){
    geneid = gene_optional;
}else{
    geneid = Object.keys(gene)[0];
}

// This will allow the display of the gene has some spaces on both sides
if(!startRuler){
    startRuler = gene[geneid].start - 5000;
}

if(!endRuler){
    endRuler = gene[geneid].end + 5000;
}

chr = gene[geneid].chr;
gene = gene[geneid];

// Used to draw genesPlot
genes_data = $.map(gene.transcripts, function(transcript, id) {
    transcript.displayText = id;
    transcript.id = id;
    transcript.gene = gene.symbol;
    transcript.strand = gene.strand;
    return transcript;
});

genes_data = $.map(genes_data, function(transcript, i) {
    transcript.ypos = i / genes_data.length;
    return transcript;
});