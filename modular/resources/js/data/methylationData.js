function updateMethylationData(){
    methylation_data = ajaxCall('/ldcluster2/methylation/' + chr + '/' + startRuler + '/' + endRuler);
}