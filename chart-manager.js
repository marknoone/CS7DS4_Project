/*
    Popup charts are the secondary charts used within the visualisation.
    Most notably when a user clicks a given stop, these charts will 
    popup and present data regarding the stop itself. 
    All charts are then managed by the ChartManager. Cart implemetnations
    havee been adapted from the following:
    - Heatmap Source:                   https://www.d3-graph-gallery.com/graph/heatmap_style.html
    - Connected Scatter Plot Source:    https://www.d3-graph-gallery.com/connectedscatter.html
    - Circular Bar Chart Source:        https://observablehq.com/@d3/radial-stacked-bar-chart
    - Radar Chart Source:               http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
    - Stacked Bar Chart Source:         https://www.d3-graph-gallery.com/graph/barplot_stacked_highlight.html
*/

const chartSize = 240;
const CHART_TYPES = Object.freeze({
    HEATMAP:                    "8702ae7c-f3ea-4349-bfde-f4774d2b3eeb",
    CONNECTED_SCATTER_PLOT:     "af6372e8-f052-45d6-9119-e467ccd1c395",
    CIRCULAR_BAR_CHART:         "77a34826-53e6-4df1-952c-6a4f6393cf59",
    RADAR:                      "df829c11-9779-42af-9a3f-76f19ebf017a",
    STACKED_BAR_CHART:          "d1d6b1d4-4a69-4a7d-bc7a-5713b6886a22"
});

var ChartManager = function (globalState, dataManger) {
    this.gs = globalState;
    this.dm = dataManger;

    // Active charts
    this.heatmap                = null;
    this.connectedScatterPlot   = null;
    this.circularBarChart       = null;
    this.radarChart             = null;
    this.stackedBarChart        = null;

    this.AddChartToElem({elemID: "#heatChart",         type: CHART_TYPES.HEATMAP});
    this.AddChartToElem({elemID: "#vehicleActivity",   type: CHART_TYPES.CONNECTED_SCATTER_PLOT});
}

ChartManager.prototype.AddChartToElem = function(chartReq){
    var svg  = d3.select(chartReq.elemID).append("svg").attr("width", chartSize).attr("height", chartSize);
    var data = this.dataManger.GetStop(this.globalState.GetActiveStopID());

    // TODO: Only pass in necessary data from stop.
    switch(chartReq.type){
        case CHART_TYPES.HEATMAP:
            return this.AttachHeatmap(svg, data);
        case CHART_TYPES.CONNECTED_SCATTER_PLOT:
            return this.AttachConnectedScatterPlot(svg, data);
        case CHART_TYPES.CIRCULAR_BAR_CHART:
            return this.AttachCircularBarChart(svg, data);
        case CHART_TYPES.RADAR:
            return this.AttachRadar(svg, data);
        case CHART_TYPES.STACKED_BAR_CHART:
            return this.AttachStackedBarChart(svg, data);
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
    var myColor = d3.scaleOrdinal().domain(allGroup).range(d3.schemeSet2);
    
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

ChartManager.prototype.AttachCircularBarChart = function(svg, data){
    this.circularBarChart = null;
}

ChartManager.prototype.AttachRadar = function(svg, data){
    this.radarChart = null;
}

ChartManager.prototype.AttachStackedBarChart = function(svg, data){
    this.stackedBarChart = null;
}

// -----------------------------------------------------------------------------
// ------------------------- Update Chart Funcs --------------------------------
// -----------------------------------------------------------------------------
ChartManager.prototype.UpdateHeatmap = function(svg, data){
    
}

ChartManager.prototype.UpdateConnectedScatterPlot = function(svg, data){
    
}

ChartManager.prototype.UpdateCircularBarChart = function(svg, data){
    
}

ChartManager.prototype.UpdateRadar = function(svg, data){
    
}

ChartManager.prototype.UpdateStackedBarChart = function(svg, data){
    
}