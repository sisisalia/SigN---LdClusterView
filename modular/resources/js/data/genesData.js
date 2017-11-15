genes_data = $.map(data.gene.transcripts, function(transcript, id) { transcript.displayText = id; transcript.id = id; transcript.gene = data.gene.symbol; transcript.strand = data.gene.strand; return transcript;});
genes_data = $.map(genes_data, function(transcript, i) { transcript.ypos = i / genes_data.length; return transcript; });
