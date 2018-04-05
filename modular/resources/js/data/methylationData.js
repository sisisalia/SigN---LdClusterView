function updateMethylationData(){
    if(typeof getMethylationData == 'function'){
        getMethylationData();
    }else{
        return;
    }
}