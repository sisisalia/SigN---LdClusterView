function updateGeneData() {
    var geneid = Object.keys(gene)[0];

    // This will allow the display of the gene has some spaces on both sides
    if (this.startRuler == -1) {
        this.startRuler = this.gene[geneid].start - 5000;
    }

    if (this.endRuler == -1) {
        this.endRuler = this.gene[geneid].end + 5000;
    }

    this.chr = this.gene[geneid].chr;
    this.gene = this.gene[geneid];

    // Used to draw genesPlot
    var genes_data = $.map(this.gene.transcripts, function (transcript, id) {
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

    this.genes_data = genes_data;
}
