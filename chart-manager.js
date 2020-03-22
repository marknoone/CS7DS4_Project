/*
    Popup charts are the secondary charts used within the visualisation.
    Most notably when a user clicks a given stop, these charts will 
    popup and present data regarding the stop itself. 
    All charts are then managed by the ChartManager. Cart implemetnations
    havee been adapted from the following:
    - Heatmap Source:                   https://www.d3-graph-gallery.com/graph/heatmap_style.html
    - Connected Scatter Plot Source:    https://www.d3-graph-gallery.com/connectedscatter.html
    - Radar Chart Source:               http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
    - Stacked Bar Chart Source:         https://www.d3-graph-gallery.com/graph/barplot_stacked_highlight.html
*/

const chartSize = 240;
const CHART_TYPES = Object.freeze({
    HEATMAP:                    "8702ae7c-f3ea-4349-bfde-f4774d2b3eeb",
    CONNECTED_SCATTER_PLOT:     "af6372e8-f052-45d6-9119-e467ccd1c395",
    RADAR:                      "df829c11-9779-42af-9a3f-76f19ebf017a",
    STACKED_BAR_CHART:          "d1d6b1d4-4a69-4a7d-bc7a-5713b6886a22"
});

var ChartManager = function (globalState) {
    this.gs = globalState;
    this.dm = this.gs.GetDataManager();

    // Active charts
    this.heatmap                = null;
    this.connectedScatterPlot   = null;
    this.radarChart             = null;
    this.stackedBarChart        = null;

    this.AddChartToElem({elemID: "#heatChart",          type: CHART_TYPES.HEATMAP});
    this.AddChartToElem({elemID: "#vehicleActivity",    type: CHART_TYPES.CONNECTED_SCATTER_PLOT});
    // this.AddChartToElem({elemID: "#routeShare",         type: CHART_TYPES.RADAR});
}

ChartManager.prototype.UpdateChart = function(chartUpdateReq){
    d3.select(chartUpdateReq.elemID).remove()
    this.AddChartToElem(chartUpdateReq)
}

ChartManager.prototype.AddChartToElem = function(chartReq){
    var svg  = d3.select(chartReq.elemID).append("svg").attr("width", chartSize).attr("height", chartSize);
    var data = this.dm.GetStopChart(this.gs.GetActiveStopID());
    
    switch(chartReq.type){
        case CHART_TYPES.HEATMAP:
            return this.AttachHeatmap(svg, data.Heatmap);
        case CHART_TYPES.CONNECTED_SCATTER_PLOT:
            return this.AttachConnectedScatterPlot(svg, data.ConnectedScatterPlot);
        case CHART_TYPES.RADAR:
            return this.AttachRadar(svg, data.RadarChart);
        case CHART_TYPES.STACKED_BAR_CHART:
            return this.AttachStackedBarChart(svg, data.StackedBarChart);
        default:
            console.error("No valid chart type specified..");
            return null;
    }
}

// -----------------------------------------------------------------------------
// ------------------------- Attach Chart Funcs --------------------------------
// -----------------------------------------------------------------------------
ChartManager.prototype.AttachHeatmap = function(svg, data){
    var myGroups = d3.map(data.values[0], function(d){return d.time;}).keys()
    var myVars = d3.map(data, function(d){return d.route;}).keys()
    var reducedData = d3.map(data, function(d){
        return d3.map(d.values, function(v){
            return { route: d.route, time: v.time, value: v.value };
        }) 
    })

    // TODO: Define colour palette with set time slots and wait times.
    var myColor = d3.scaleSequential().interpolator(d3.interpolateInferno).domain([1,100])

    var x = d3.scaleBand().range([ 20, chartSize ]).domain(myGroups).padding(0.05);
    svg.append("g").style("fill", "#333").style("font-size", 15)
        .attr("transform", "translate(0," + (chartSize-20) + ")")
        .call(d3.axisBottom(x).tickSize(0)).select(".domain").remove();

    
    var y = d3.scaleBand().range([ chartSize-20, 0 ]).domain(myVars).padding(0.05);
    svg.append("g").style("font-size", 15).attr("transform", "translate(20,0)")
        .call(d3.axisLeft(y).tickSize(0)).select(".domain").remove();

    // TODO: Get tooltip working && move as many styles to CSS as possible
    var tooltip = d3.select("#my_dataviz").append("div").style("opacity", 0)
        .attr("class", "tooltip").style("background-color", "white").style("border", "solid")
        .style("border-width", "2px").style("border-radius", "5px").style("padding", "5px")

    // Create the heatmap
    svg.selectAll()
        .data(reducedData, function(d) {return d.timeslot+':'+d.route;})
        .enter().append("rect")

        // Individual attribute specification
        .attr("x", function(d) { return x(d.timeslot) })
        .attr("y", function(d) { return y(d.route) })
        .attr("rx", 4).attr("ry", 4)
        .attr("width", x.bandwidth()).attr("height", y.bandwidth())
        
        // Heatmap styles
        .style("fill", function(d) { return myColor(d.avgWait)} )
        .style("stroke-width", 4).style("stroke", "none").style("opacity", 0.8)

        // Mouse event registration
        .on("mouseover", function(d) { tooltip.style("opacity", 1);
            d3.select(this).style("stroke", "#333").style("opacity", 1)})
            
        .on("mousemove", function(d) { tooltip.html("The exact value of<br>this cell is: " + d.avgWait)
        .style("left", (d3.mouse(this)[0]+70) + "px").style("top", (d3.mouse(this)[1]) + "px")})

        .on("mouseleave", function(d) { tooltip.style("opacity", 0); 
            d3.select(this).style("stroke", "none").style("opacity", 0.8)});

    this.heatmap = svg;
}

ChartManager.prototype.AttachConnectedScatterPlot = function(svg, data){
    var allGroups = data.map(d => d.route);
    var myColor = d3.scaleOrdinal().domain(allGroups).range(d3.schemeSet2);
    
    // Add X axis
    var x = d3.scaleLinear().domain([0,10]).range([ 0, chartSize ]);
    svg.append("g").attr("transform", "translate(0," + chartSize + ")").call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear().domain( [0,20]).range([ chartSize, 0 ]);
    svg.append("g").call(d3.axisLeft(y));

    // Add the lines
    var line = d3.line().x(function(d) { return x(+d.time) })
      .y(function(d) { return y(+d.count) });
    
    svg.selectAll("myLines").data(data).enter()
      .append("path")
        .attr("d", function(d){ return line(d.values) } )
        .attr("stroke", function(d){ return myColor(d.route) })
        .style("stroke-width", 4).style("fill", "none");

    // Add the points
    svg.selectAll("myDots").data(data).enter()
        .append('g').style("fill", function(d){ return myColor(d.route) })
        .selectAll("myPoints").data(function(d){ return d.values })
        .enter().append("circle")
        .attr("cx", function(d) { return x(d.time) } )
        .attr("cy", function(d) { return y(d.value) } )
        .attr("r", 5).attr("stroke", "white");

    // Add a legend at the end of each line
    svg.selectAll("myLabels").data(data).enter()
        .append('g').append("text")
          .datum(function(d) { return {name: d.route, value: d.values[d.values.length - 1]}; }) 
          .attr("transform", function(d) { return "translate(" + x(d.value.time) + "," + y(d.value.value) + ")"; })
          .attr("x", 12).text(function(d) { return d.route; })
          .style("fill", function(d){ return myColor(d.route) })
          .style("font-size", 15);
    
    this.connectedScatterPlot = svg;
}

ChartManager.prototype.AttachRadar = function(svg, data){
    this.radarChart = null;
    var cfg = {
        w: chartSize,				
        h: chartSize,				
        margin: {top: 15, right: 15, bottom: 15, left: 15}, 
        levels: 5,				//How many levels or inner circles should there be drawn
        labelFactor: 1.25, 	    //How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		    //The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35, 	    //The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 2, 		//The width of the stroke around each blob
        roundStrokes: true,     //If true the area and stroke will follow a round path (cardinal-closed)
        color:d3.scaleOrdinal().range(["#EDC951","#CC333F","#00A0B0"]),	//Color function
        maxVal:  0
    };
       
    var maxValue = Math.max(cfg.maxValue, d3.max(data, function(d){return d3.max(d.values.map(function(i){return i.value;}))}))    
    var allAxis = (data[0].values.map(function(v){return v.time})),	//Names of each axis
        total = allAxis.length,					//The number of different axes
        radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
        Format = d3.format('%'),			 	//Percentage formatting
        angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
       
    
    var rScale = d3.scaleLinear().range([0, radius]).domain([0, maxValue]); //Scale for the radius
    var g = svg.append("g").attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
    var filter = g.append('defs').append('filter').attr('id','glow'),
        feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
        feMerge = filter.append('feMerge'),
        feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

    var axisGrid = g.append("g").attr("class", "axisWrapper"); // Draw circular grid
    axisGrid.selectAll(".levels").data(d3.range(1,(cfg.levels+1)).reverse()).enter()
        .append("circle").attr("class", "gridCircle").attr("r", function(d, i){return radius/cfg.levels*d;})
        .style("fill", "#CDCDCD").style("stroke", "#CDCDCD")
        .style("fill-opacity", cfg.opacityCircles).style("filter" , "url(#glow)");

    axisGrid.selectAll(".axisLabel")
        .data(d3.range(1,(cfg.levels+1)).reverse()).enter().append("text")
        .attr("class", "axisLabel").attr("x", 4)
        .attr("y", function(d){return -d*radius/cfg.levels;}).attr("dy", "0.4em")
        .style("font-size", "10px").attr("fill", "#737373")
        .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

    var axis = axisGrid.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");
    axis.append("line").attr("x1", 0).attr("y1", 0) //Append the lines
        .attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
        .attr("class", "line").style("stroke", "white").style("stroke-width", "2px");

    axis.append("text").attr("class", "legend").style("font-size", "11px").attr("text-anchor", "middle").attr("dy", "0.35em")
        .attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
        .text(function(d){return d}).call(util.WrapRadar, cfg.wrapWidth);
   
       
    var radarLine = d3.svg.line.radial().interpolate("linear-closed")
        .radius(function(d) { return rScale(d.value); }).angle(function(d,i) {	return i*angleSlice; });
    if(cfg.roundStrokes) { radarLine.interpolate("cardinal-closed"); }
                
    var blobWrapper = g.selectAll(".radarWrapper").data(data => d.values).enter().append("g").attr("class", "radarWrapper");	
    blobWrapper.append("path").attr("class", "radarArea").attr("d", function(d,i) { return radarLine(d); })
        .style("fill", function(d,i) { return cfg.color(i); }).style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function (d,i){
            d3.selectAll(".radarArea").transition().duration(200).style("fill-opacity", 0.1); 
            d3.select(this).transition().duration(200).style("fill-opacity", 0.7);	
        })
        .on('mouseout', function(){ d3.selectAll(".radarArea").transition().duration(200).style("fill-opacity", cfg.opacityArea) });
        
    blobWrapper.append("path").attr("class", "radarStroke").attr("d", function(d,i) { return radarLine(d); })
        .style("stroke-width", cfg.strokeWidth + "px").style("stroke", function(d,i) { return cfg.color(i); })
        .style("fill", "none").style("filter" , "url(#glow)");		
    
    blobWrapper.selectAll(".radarCircle").data(function(d,i) { return d; }).enter().append("circle")
        .attr("class", "radarCircle").attr("r", cfg.dotRadius)
        .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
        .style("fill", function(d,i,j) { return cfg.color(j); }).style("fill-opacity", 0.8);

    var blobCircleWrapper = g.selectAll(".radarCircleWrapper").data(data => d.values).enter()
        .append("g").attr("class", "radarCircleWrapper");
    blobCircleWrapper.selectAll(".radarInvisibleCircle").data(function(d,i) { return d; }).enter().append("circle")
        .attr("class", "radarInvisibleCircle").attr("r", cfg.dotRadius*1.5)
        .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
        .style("fill", "none").style("pointer-events", "all").on("mouseover", function(d,i) {
            newX =  parseFloat(d3.select(this).attr('cx')) - 10;
            newY =  parseFloat(d3.select(this).attr('cy')) - 10;
            tooltip.attr('x', newX).attr('y', newY).text(Format(d.value)).transition().duration(200).style('opacity', 1);
        })
        .on("mouseout", function(){ tooltip.transition().duration(200).style("opacity", 0); });
        
    var tooltip = g.append("text").attr("class", "tooltip").style("opacity", 0);
    this.radarChart = svg;
}

ChartManager.prototype.AttachStackedBarChart = function(svg, data){
    this.stackedBarChart = null;

    // TODO: chnage to finds actual max sum of data
    const maxTravelTime = 120;
    var groups = d3.map(data, function(d){return(d.destination)}).keys()
    var subgroups = data.columns.slice(1)

    // Add X axis
    var x = d3.scaleBand().domain(groups).range([0, chartSize]).padding([0.2])
    svg.append("g").attr("transform", "translate(0," + chartSize + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    var y = d3.scaleLinear().domain([0, maxTravelTime]).range([ chartSize, 0 ]);
    svg.append("g").call(d3.axisLeft(y));

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal().domain(subgroups).range(d3.schemeSet2);

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack().keys(subgroups)(data)

    // Show the chart
    svg.append("g").selectAll("g")
        .data(stackedData)
        .enter().append("g")
            .attr("fill", function(d) { return color(d.key); })
            .attr("class", function(d){ return "myRect " + d.key }).selectAll("rect")
        
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d) { return d; })
        .enter().append("rect")
            .attr("x", function(d) { return x(d.data.group); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .attr("stroke", "grey")
            .on("mouseleave", function(d) { d3.selectAll(".myRect").style("opacity",0.8) })
            .on("mouseover", function(d) {
                var subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
                var subgroupValue = d.data[subgroupName];
                d3.selectAll(".myRect").style("opacity", 0.2)
                d3.selectAll("."+subgroupName).style("opacity", 1)
            });
}