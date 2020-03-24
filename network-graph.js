// The following Network graph is an adapted graph from:
// https://bl.ocks.org/cjrd/6863459

// Global Consts ----------------------------------------------
const minLat = 53.1000, maxLat = 53.5000;
const minLng = -6.65, maxLng = -6.00;
const minScale = 0.5, maxScale = 20;
const minRadius = 1, maxRadius = 8; 
const minNodeStroke = 0.25, maxNodeStroke = 2; 
const minLineStroke = 0.5, maxLineStroke = 6; 
const minFont = 1, maxFont = 12; 
const minFontDist = 2, maxFontDist = 18; 

const opColours = { 
    LUAS: "#6237A1", // Luas
    GAD:  "#00A7DF", // Go Ahead
    DUB:  "#FDCA01", // Dublin Bus
    IR:   "#32A441", // Irish Rail
    BE:   "#CD1C38"  // Bus Eireann
}

// ------------------------------------------------------------
// ----------------------- Constructor ------------------------
// ------------------------------------------------------------
var NetworkGraph = function(globalState){
    this.gs        = globalState;
    this.nodes     = [];
    this.edges     = [];
    this.stopTimes = {};
    this.map       = globalState.GetMapManager().GetMap();

    this.latLimits        = { min: minLat,         max: maxLat        }
    this.lngLimits        = { min: minLng,         max: maxLng        }
    this.fontLimits       = { min: minFont,        max: maxFont       }
    this.scaleLimits      = { min: minScale,       max: maxScale      }
    this.nodeStrokeLimits = { min: minNodeStroke,  max: maxNodeStroke }
    this.lineStrokeLimits = { min: minLineStroke,  max: maxLineStroke }
    this.radiiLimits      = { min: minRadius,      max: maxRadius     }
    this.fontDistLimits   = { min: minFontDist,    max: maxFontDist   }

    this.scale = 1
    this.vehicleScale = 5;
    this.state = {
        selectedNode: null,
        selectedEdge: null,
        mouseDownNode: null,
        mouseDownLink: null,
        isZoomBehaviourActive: false,
        lastKeyDown: -1
    };

    
    this.svg = d3.select("#map").select("svg");
    var svgG = this.svgG = this.svg.append("g")
        .classed("graph", true);
    
    this.paths = svgG.append("g").selectAll("g"); // Path subgraph
    this.circles = svgG.append("g").selectAll("g"); // Edge subgraph
    this.activeVehicles = svgG.append("g").selectAll("g"); // Vehicle subgraph

    // Set coordinate scales ---------------------------------
    var thisGraph = this;
    this.xScale = d3.scaleLinear()
        .domain([thisGraph.lngLimits.min, thisGraph.lngLimits.max])
        .range([0, thisGraph.svg.attr("width")]);

    this.yScale = d3.scaleLinear()
        .domain([thisGraph.latLimits.min, thisGraph.latLimits.max])
        .range([thisGraph.svg.attr("height"), 0]);

    this.zoomScale = d3.scaleLog()
        .domain([thisGraph.scaleLimits.min, thisGraph.scaleLimits.max])
        .range([thisGraph.radiiLimits.max, thisGraph.radiiLimits.min]);

    this.nodeStrokeScale = d3.scaleLog()
        .domain([thisGraph.scaleLimits.min, thisGraph.scaleLimits.max])
        .range([thisGraph.nodeStrokeLimits.max, thisGraph.nodeStrokeLimits.min]);

    this.lineStrokeScale = d3.scaleLog()
        .domain([thisGraph.scaleLimits.min, thisGraph.scaleLimits.max])
        .range([thisGraph.lineStrokeLimits.max, thisGraph.lineStrokeLimits.min]);

    this.fontScale = d3.scaleLog()
        .domain([thisGraph.scaleLimits.min, thisGraph.scaleLimits.max])
        .range([thisGraph.fontLimits.max, thisGraph.fontLimits.min]);

    this.fontDistScale = d3.scaleLog()
        .domain([thisGraph.scaleLimits.min, thisGraph.scaleLimits.max])
        .range([thisGraph.fontDistLimits.max, thisGraph.fontDistLimits.min]);
    
    this.map.on('zoomend', () => { thisGraph.updateGraph(); });
    // Register zoom behaviour callbacks ---------------------
    // this.svg.call(d3.zoom()
    //     .scaleExtent([thisGraph.scaleLimits.min, thisGraph.scaleLimits.max])    
    //     .on("zoom", function(){
    //         thisGraph.zoomed.call(thisGraph);
    //     })
    //     .on("start", function(){
    //         d3.select('body').style("cursor", "move");
    //      })
    //     .on("end", function(){
    //         d3.select('body').style("cursor", "auto");
    //     }))
    //     .on("dblclick.zoom", null);

    // Register callbacks for mouse/key events ----------------
    this.svg.on("mousedown", function(d){ thisGraph.svgMouseDown.call(thisGraph, d);});
    this.svg.on("mouseup", function(d){ thisGraph.svgMouseUp.call(thisGraph, d);});
    d3.select(window)
        .on("keydown", function(){ thisGraph.svgKeyDown.call(thisGraph); })
        .on("keyup", function(){ thisGraph.svgKeyUp.call(thisGraph); });

    window.onresize = function(){ thisGraph.updateWindow(thisGraph.svg); };   
    this.buildGraph(); 
};


// ------------------------------------------------------------
// --------------------- Graph Constants ----------------------
// ------------------------------------------------------------

NetworkGraph.prototype.consts =  {
    selectedClass: "selected",
    connectClass: "connect-node",
    circleGClass: "conceptG",
    graphClass: "graph",
    BACKSPACE_KEY: 8,
    DELETE_KEY: 46,
    ENTER_KEY: 13
};


// ------------------------------------------------------------
// --------------------- Prototype Funcs ----------------------
// ------------------------------------------------------------
NetworkGraph.prototype.setLatLimits = function(latLimits){ this.latLimits = latLimits; };
NetworkGraph.prototype.setLngLimits = function(lngLimits){ this.lngLimits = lngLimits; };
NetworkGraph.prototype.zoomed = function(){
    this.state.isZoomBehaviourActive = true;
    d3.select("." + this.consts.graphClass).attr("transform", d3.event.transform);
    
    // Update scales only on scale change
    if (this.scale === d3.event.transform.k)
        return 

    this.scale = d3.event.transform.k 
    this.updateScales.call(this);
};
 
NetworkGraph.prototype.updateWindow = function(svg){
    var document = window.document.documentElement,
            body = window.document.getElementsByTagName('body')[0];

    var width  = window.innerWidth || document.clientWidth || body.clientWidth,
        height =  window.innerHeight|| document.clientHeight|| body.clientHeight;
    svg.attr("width", width).attr("height", height);
};

NetworkGraph.prototype.insertNodeID = function (gEl, title) {
    var thisGraph = this;
    var el = gEl.append("text")
          .attr("text-anchor","middle")
          .attr("font-size", thisGraph.fontScale(thisGraph.scale))
          .attr("dy", "-7.5");
    var tspan = el.append('tspan').text(title);
    tspan.attr('x', 0)
        .attr('dy', thisGraph.fontDistScale(thisGraph.scale));
};


// Mouse Activity --------------------------------------------
NetworkGraph.prototype.svgMouseDown = function(){ this.state.graphMouseDown = true; };
NetworkGraph.prototype.svgMouseUp = function(){
    var state = this.state;
    state.graphMouseDown = false;
    if (state.isZoomBehaviourActive) { state.isZoomBehaviourActive = false; } 
    /* 
    Do any click events here...
    */
};

// Keyboard Activity -------------------------------------------
NetworkGraph.prototype.svgKeyUp = function() { this.state.lastKeyDown = -1; };
NetworkGraph.prototype.svgKeyDown = function() {
    var state = this.state, consts = this.consts;
    // make sure repeated key presses don't register for each keydown
    if(state.lastKeyDown !== -1) return;
    state.lastKeyDown = d3.event.keyCode;

    switch(d3.event.keyCode) {
    case consts.BACKSPACE_KEY:
    case consts.DELETE_KEY:
      d3.event.preventDefault();
       /* 
        Do any keyboard events here...
       */
      break;
    }
 };

// Build --------------------------------------------------
NetworkGraph.prototype.buildGraph = function(){
    // Populate nodes
    var stopData = this.gs.GetDataManager().GetStops(), thisGraph = this;
    Object.keys(stopData).forEach( stopKey => {
        var loc = {}, stop = stopData[stopKey];
        try{ loc = new L.LatLng(stop.LatLng.Lat, stop.LatLng.Lng); } 
        catch(err) { console.log('error', err) }

        thisGraph.nodes.push({
            title: stop.stop_name, 
            id: stop.stop_id,
            latLng: loc, 
            operator: "LUAS",
        })

        Object.keys(stop.ConnectedStops).forEach( key => {
            var tLoc = {}, target = stopData[key];
            try{ tLoc = new L.LatLng(target.LatLng.Lat, target.LatLng.Lng); } 
            catch(err) { console.log('error', err) }
            thisGraph.edges.push({
                source: { id : stopKey, latLng: loc  },
                target: { id : key,     latLng: tLoc },
                children: []
            })
        });
    })

    // Add vehicle trips
    this.stopTimes = this.gs.GetDataManager().GetStopTimeTrips(), thisGraph = this;
    this.updateGraph();
};

// Update -------------------------------------------------
NetworkGraph.prototype.updateGraph = function(){
    var thisGraph = this, 
        consts = thisGraph.consts, 
        state = thisGraph.state;

    // Remove all older elements
    d3.selectAll(".link").remove();
    d3.selectAll("."+consts.circleGClass).remove();

    // Generate path data with custom D3 keys...
    this.paths = this.paths.data(this.edges, function(d){
      return String(d.source.id) + "+" + String(d.target.id);
    });

    // Update paths ---------------------------------
    this.paths
      .classed(consts.selectedClass, function(d){
        return d === state.selectedEdge;
      })
      .attr("data-distance", function(d){ return util.Distance(
        thisGraph.map.latLngToLayerPoint(d.source.latLng).x, // x1
        thisGraph.map.latLngToLayerPoint(d.target.latLng).x, // x2
        thisGraph.map.latLngToLayerPoint(d.source.latLng).y, // y1
        thisGraph.map.latLngToLayerPoint(d.target.latLng).y  // y2
     )})
      .attr("stroke", function(d){ 
        return opColours[d.source.operator]? opColours[d.source.operator] : "#333"})
      .attr("stroke-width", thisGraph.lineStrokeScale(thisGraph.scale) + "px")
      .attr("d", function(d){
        return "M" + thisGraph.map.latLngToLayerPoint(d.source.latLng).x + "," + thisGraph.map.latLngToLayerPoint(d.source.latLng).y + 
            "L" + thisGraph.map.latLngToLayerPoint(d.target.latLng).x + "," + thisGraph.map.latLngToLayerPoint(d.target.latLng).y;
      });

    this.paths.enter()
      .append("path")
      .classed("link", true)
      .attr("data-distance", function(d){ return util.Distance(
          thisGraph.map.latLngToLayerPoint(d.source.latLng).x, // x1
          thisGraph.map.latLngToLayerPoint(d.target.latLng).x, // x2
          thisGraph.map.latLngToLayerPoint(d.source.latLng).y, // y1
          thisGraph.map.latLngToLayerPoint(d.target.latLng).y  // y2
       )})
      .attr("stroke", function(d){ 
        return opColours[d.source.operator]? opColours[d.source.operator] : "#333"})
      .attr("stroke-width", thisGraph.lineStrokeScale(thisGraph.scale) + "px")
      .attr("d", function(d){
        return "M" + thisGraph.map.latLngToLayerPoint(d.source.latLng).x + "," + thisGraph.map.latLngToLayerPoint(d.source.latLng).y + 
            "L" + thisGraph.map.latLngToLayerPoint(d.target.latLng).x + "," + thisGraph.map.latLngToLayerPoint(d.target.latLng).y;
      });

    this.paths.exit().remove();
    
    // Update nodes ..........................................
    this.circles = this.circles.data(this.nodes, function(d){ return d.id;});
    this.circles.attr("transform", function(d) { 
        return "translate("+ 
            thisGraph.map.latLngToLayerPoint(d.latLng).x +","+ 
            thisGraph.map.latLngToLayerPoint(d.latLng).y +")";
    })
    .attr("stroke", function(d){ 
        return opColours[d.operator]? opColours[d.operator] : "#333"});

    var newGs= this.circles.enter()
          .append("g");

    newGs.classed(consts.circleGClass, true)
        .attr("transform", function(d) { 
            return "translate("+ 
                thisGraph.map.latLngToLayerPoint(d.latLng).x +","+ 
                thisGraph.map.latLngToLayerPoint(d.latLng).y +")";
        })
       .attr("stroke", function(d){ 
          return opColours[d.operator]? opColours[d.operator] : "#333"})
      .on("mouseover", function(d){ /* Adjust CSS classes */ })
      .on("mouseout", function(d){ /* Adjust CSS classes */})
      .on("mousedown", function(d){ /* De-register selected node */})
      .on("mouseup", function(d){ /* Register selected node */ });

    newGs.append("circle")
        .attr("r", String(thisGraph.zoomScale(thisGraph.scale)))
        .attr("stroke-width", thisGraph.nodeStrokeScale(thisGraph.scale) + "px");
    newGs.each(function(d){ thisGraph.insertNodeID(d3.select(this), d.title); });

    this.circles.exit().remove();
    this.UpdateVehicles();
  };

NetworkGraph.prototype.UpdateVehicles = function(){
    var thisGraph = this, 
        simTime = this.gs.GetSimTime(),
        vehicles = [],
        services = this.gs.GetDataManager().GetServices(),
        stops = this.gs.GetDataManager().GetStops(),
        trips = this.gs.GetDataManager().GetTrips(),
        metricObj = {
            busCount: 0, 
            trainCount: 0, 
            tramCount: 0
    };

    if (!(util.ToGTFSDate(simTime) in services)){
        console.error("No Vehicle Services Found...")
        return;
    }

    var activeServices = services[util.ToGTFSDate(simTime)].map(d => { return d.split(":")[1]});
    Object.keys(this.stopTimes).forEach(function(key) {
        if(!util.IsTimeBetweenGTFSTimesMin(
            simTime, thisGraph.stopTimes[key].startTime, thisGraph.stopTimes[key].endTime))
                return

        var stopTime = thisGraph.stopTimes[key], lastDep = "", lastDepID = "";
        var [tag, tripID] = key.split(":")
        if (!activeServices.includes(trips[key].service_id)) return;

        Object.keys(stopTime).forEach(function(tKey){
            if (tKey === "startTime" || tKey == "endTime") return

            [arr, dep] = tKey.split("-");
            if(lastDep === "") { lastDep = dep; lastDepID = stopTime[tKey].StopID; return } 
            if(!util.IsTimeBetweenGTFSTimesMin(simTime, lastDep, arr)){
                lastDep = dep; lastDepID = stopTime[tKey].StopID; return }

            var stop1 = stops[lastDepID];
            var stop2 = stops[stopTime[tKey].StopID];
            var lastDepSecs = util.GetSecondsFromArr(util.GetGTFSTime(lastDep)),
                arrSecs = util.GetSecondsFromArr(util.GetGTFSTime(arr)),
                simSecs = util.GetSecondsFromDate(simTime);
            var timePerc = (simSecs - lastDepSecs) / (arrSecs - lastDepSecs)

            // Interpolate position
            var p = util.PointBetweenPerc({lat1:stop1.LatLng.Lat, lng1:stop1.LatLng.Lng, 
                lat2: stop2.LatLng.Lat, lng2: stop2.LatLng.Lng}, timePerc);

            try{ vLoc = new L.LatLng(p.lat, p.lng);} 
            catch(err) { console.log('error', err) }
            vehicles.push({
                id: key + "-" + tKey,
                latLng: vLoc,
                operator: tagMap[tag]
            })

            lastDep = dep;
            metricObj.tramCount = metricObj.tramCount + 1;
        });
    });

    // Remove all older elements
    d3.selectAll(".vehicle").remove();
    this.activeVehicles = this.activeVehicles.data(vehicles, function(d){ return d.id;});
    this.activeVehicles.attr("transform", function(d) { 
        return "translate("+ 
            thisGraph.map.latLngToLayerPoint(d.latLng).x +","+ 
            thisGraph.map.latLngToLayerPoint(d.latLng).y +")";
    })
    .attr("fill", "#ee5253");

    var newGs= this.activeVehicles.enter().append("g");
    newGs.classed("vehicle", true)
        .attr("transform", function(d) { 
            return "translate("+ 
                thisGraph.map.latLngToLayerPoint(d.latLng).x +","+ 
                thisGraph.map.latLngToLayerPoint(d.latLng).y +")";
        })
        .attr("fill", "#ee5253")
      .on("mouseover", function(d){ /* Adjust CSS classes */ })
      .on("mouseout", function(d){ /* Adjust CSS classes */})
      .on("mousedown", function(d){ /* De-register selected node */})
      .on("mouseup", function(d){ /* Register selected node */ });

    newGs.append("circle")
        .attr("r", String(thisGraph.vehicleScale))
        .attr("fill", "#ee5253");

    this.activeVehicles.exit().remove();
    this.gs.SetVehicleMetrics(metricObj);
}

NetworkGraph.prototype.updateScales = function(){
    var thisGraph = this;

    // Update Strokes
    d3.selectAll("circle")
        .attr("r", String(thisGraph.zoomScale(thisGraph.scale)))
        .attr("stroke-width", thisGraph.nodeStrokeScale(thisGraph.scale) + "px");

    thisGraph.svgG.selectAll("path")
        .attr("stroke-width", thisGraph.lineStrokeScale(thisGraph.scale) + "px");

    // Update Fonts
    thisGraph.svgG.selectAll("text")
        .attr("font-size", thisGraph.fontScale(thisGraph.scale));
    thisGraph.svgG.selectAll("tspan")
        .attr('dy', thisGraph.fontDistScale(thisGraph.scale));

    this.evaluateCollisions.call(this);
};

NetworkGraph.prototype.UpdateFilters = function() {
    var filters = this.gs.GetFilters();
    console.log(filters);
    // On filter change...
}

NetworkGraph.prototype.evaluateCollisions = function(){
    var edges = this.edges;
    // For all nodes
    // -- Detect those with tiny distances
    // -- Remove link between 
    // -- Create new Uber node,
    // -- Attach uber node to all links that both already linked too 
    // ----- Note: make sure to preserve route origin departure times.
    // -- Remove old edges.
};

