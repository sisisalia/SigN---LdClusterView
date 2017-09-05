function enableHover(mainSVGid) {

    var hoverSvg = d3.select("#" + mainSVGid);

    d3.selectAll(".mainContent").on("mousemove", function() {
        if(document.getElementById('showHover').checked){
            // document.scrollleft seems to be 0 though
            // replacing with 0 still makes it work
            var scrollVal = $(document).scrollLeft();
            var height = $("#" + mainSVGid).height();
            $("#hoverSVG").remove();
            hoverSvg.append('line')
                .attr('id', 'hoverSVG')
                .attr('x1', d3.event.x + scrollVal)
                .attr('y1', 0)
                .attr('x2', d3.event.x + scrollVal)
                .attr('y2', height);
        }
    })

    .on("mouseout", function() {
        if(document.getElementById('showHover').checked){
            $("#hoverSVG").remove();
        }
    });
}
