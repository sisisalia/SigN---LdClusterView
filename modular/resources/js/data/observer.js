function ObserverList(){
    this.observerList = [];
}
ObserverList.prototype.add = function( obj ){
    return this.observerList.push( obj );
};
ObserverList.prototype.count = function(){
    return this.observerList.length;
};
ObserverList.prototype.get = function( index ){
    if( index > -1 && index < this.observerList.length ){
        return this.observerList[ index ];
    }
};
ObserverList.prototype.indexOf = function( obj, startIndex ){
    var i = startIndex;

    while( i < this.observerList.length ){
        if( this.observerList[i] === obj ){
            return i;
        }
        i++;
    }

    return -1;
};
ObserverList.prototype.removeAt = function( index ){
    this.observerList.splice( index, 1 );
};

function Subject(){
    this.observers = new ObserverList();
}

Subject.prototype.addObserver = function( observer ){
    this.observers.add( observer );
};

Subject.prototype.removeObserver = function( observer ){
    this.observers.removeAt( this.observers.indexOf( observer, 0 ) );
};

Subject.prototype.notify = function( context ){
    var observerCount = this.observers.count();
    var manhattanCounter = 0;
    for(var i=0; i < observerCount; i++){
        if(this.observers.get(i) == 'manhattanPlot'){
            // prevent multiple activation
            if(manhattanCounter != 0) continue;
            manhattanCounter = 1;
            updateManhattanData();
        }
        if(this.observers.get(i) == 'leafNodesPlot'){
            updateLeafNodesData();
        }
        if(this.observers.get(i) == 'barChartPlot'){
            updateMethylationData();
        }
    }

    //exclude out sankey plot if it is not in the range
    //currently because data is not from database yet
    var probe_inside = 0;
    for(var i = 0; i < mqtls_raw.length; i++){
        if((mqtls_raw[i].probe_position <= endRuler)&&(mqtls_raw[i].probe_position >= startRuler)){
            probe_inside = 1;
        }
    }
    if((probe_inside != 0) && ($('.show_mainSankeyPlot').length == 0)){
        $('#invisible').append('<li class="show_mainSankeyPlot">Sankey Plot</li>');
    }

    renderEverything();
};

subject = new Subject();

