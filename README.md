# LdClusterViewer

LdClusterView is a web-based genome browser which extends the basic layout of stacked plots. First extension is the corporation of a dendrogram to describe the relationship between the stacked plots, where each plot is representing a genetic haplotype. Second extension is by utilizing Sankey plot to visualize the relationship between the elements in two different plots, in this case between DNA methylation and haplotype. These improvements allow LdClusterView to depict the complex relationship between genetic variations and show interplay between three different biological layers; Transcript, Genetic and Epigenomic, respectively.

Data required are gene, gene, eqtls, ld_snps, methylation, mqtls as described in https://github.com/sisisalia/SigN---LdClusterView/blob/master/Data%20description.docx

Setting up the data and running the application:
1. Input the data into respective variables. No restriction is made in naming the variables.
2. At 'modular/modular.html', insert : <br />
        // the parameters are : gene data, eqtls data, ld_snps data, methylation data, mqtls data, entry point to html DOM (must input either id(#) or class(.)) <br />
        var myPlot = new LdClusterView(gene,eqtls,ld_snps,methylation,mqtls, "#inserthere"); <br />
        // activate plot function <br />
        myPlot.plot(); <br />
   Similarly, no restriction in naming of the variable 'myPlot'.
3. Run 'modular/modular.html'.

Currently the files are accompanied by the sample data. Hence, to delete sample data :
1. Delete 'modular/resources/js/data/data.js' file
2. At 'modular/modular.html' : 
   - Delete "<div id="inserthere"></div>" at line 8
   - Delete "<script type="text/javascript" src="resources/js/data/data.js"></script>" at line 272
   - Delete myPlot declarations at line 293 and 294

Demo : https://sisisalia.github.io/SigN---LdClusterView/modular/modular.html
