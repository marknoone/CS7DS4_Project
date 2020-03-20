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


// ------------------------------------------------------------
// ----------------------- Constructor ------------------------
// ------------------------------------------------------------
var NetworkGraph = function(globalState, svg, nodes, edges, colours, map){
    this.nodes   = nodes   || [];
    this.edges   = edges   || [];
    this.colours = colours || [];
    this.map     = map
    this.globalState = globalState;
    this.latLimits        = { min: minLat,         max: maxLat        }
    this.lngLimits        = { min: minLng,         max: maxLng        }
    this.fontLimits       = { min: minFont,        max: maxFont       }
    this.scaleLimits      = { min: minScale,       max: maxScale      }
    this.nodeStrokeLimits = { min: minNodeStroke,  max: maxNodeStroke }
    this.lineStrokeLimits = { min: minLineStroke,  max: maxLineStroke }
    this.radiiLimits      = { min: minRadius,      max: maxRadius     }
    this.fontDistLimits   = { min: minFontDist,    max: maxFontDist   }

    this.scale = 1
    this.state = {
        selectedNode: null,
        selectedEdge: null,
        mouseDownNode: null,
        mouseDownLink: null,
        isZoomBehaviourActive: false,
        lastKeyDown: -1
    };

    this.svg = svg;
    var svgG = this.svgG = svg.append("g")
        .classed("graph", true);
    
    this.paths = svgG.append("g").selectAll("g"); // Path subgraph
    this.circles = svgG.append("g").selectAll("g"); // Edge subgraph

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

// Update -------------------------------------------------
NetworkGraph.prototype.updateGraph = function(){
    var thisGraph = this, consts = thisGraph.consts, state = thisGraph.state;

    // Generate path data with custom D3 keys...
    this.paths = this.paths.data(this.edges, function(d){
      return String(d.source.id) + "+" + String(d.target.id);
    });

    // Update paths ---------------------------------
    this.paths
      .classed(consts.selectedClass, function(d){
        return d === state.selectedEdge;
      })
      .attr("data-distance", function(d){ return util.dist(
        thisGraph.map.latLngToLayerPoint(d.source.LatLng).x, // x1
        thisGraph.map.latLngToLayerPoint(d.target.LatLng).x, // x2
        thisGraph.map.latLngToLayerPoint(d.source.LatLng).y, // y1
        thisGraph.map.latLngToLayerPoint(d.target.LatLng).y  // y2
     )})
      .attr("stroke", function(d){ 
        return thisGraph.colours[d.source.operator]? thisGraph.colours[d.source.operator] : "#333"})
      .attr("stroke-width", thisGraph.lineStrokeScale(thisGraph.scale) + "px")
      .attr("d", function(d){
        return "M" + thisGraph.map.latLngToLayerPoint(d.source.LatLng).x + "," + thisGraph.map.latLngToLayerPoint(d.source.LatLng).y + 
            "L" + thisGraph.map.latLngToLayerPoint(d.target.LatLng).x + "," + thisGraph.map.latLngToLayerPoint(d.target.LatLng).y;
      });

    this.paths.enter()
      .append("path")
      .classed("link", true)
      .attr("data-distance", function(d){ return util.dist(
          thisGraph.map.latLngToLayerPoint(d.source.LatLng).x, // x1
          thisGraph.map.latLngToLayerPoint(d.target.LatLng).x, // x2
          thisGraph.map.latLngToLayerPoint(d.source.LatLng).y, // y1
          thisGraph.map.latLngToLayerPoint(d.target.LatLng).y  // y2
       )})
      .attr("stroke", function(d){ 
        return thisGraph.colours[d.source.operator]? thisGraph.colours[d.source.operator] : "#333"})
      .attr("stroke-width", thisGraph.lineStrokeScale(thisGraph.scale) + "px")
      .attr("d", function(d){
        return "M" + thisGraph.map.latLngToLayerPoint(d.source.LatLng).x + "," + thisGraph.map.latLngToLayerPoint(d.source.LatLng).y + 
            "L" + thisGraph.map.latLngToLayerPoint(d.target.LatLng).x + "," + thisGraph.map.latLngToLayerPoint(d.target.LatLng).y;
      });

    this.paths.exit().remove();
    
    // Update nodes ..........................................
    this.circles = this.circles.data(this.nodes, function(d){ return d.id;});
    this.circles.attr("transform", function(d) { 
        return "translate("+ 
            thisGraph.map.latLngToLayerPoint(d.LatLng).x +","+ 
            thisGraph.map.latLngToLayerPoint(d.LatLng).y +")";
    })
    .attr("stroke", function(d){ 
        return thisGraph.colours[d.operator]? thisGraph.colours[d.operator] : "#333"});

    var newGs= this.circles.enter()
          .append("g");

    newGs.classed(consts.circleGClass, true)
        .attr("transform", function(d) { 
            return "translate("+ 
                thisGraph.map.latLngToLayerPoint(d.LatLng).x +","+ 
                thisGraph.map.latLngToLayerPoint(d.LatLng).y +")";
        })
       .attr("stroke", function(d){ 
          return thisGraph.colours[d.operator]? thisGraph.colours[d.operator] : "#333"})
      .on("mouseover", function(d){ /* Adjust CSS classes */ })
      .on("mouseout", function(d){ /* Adjust CSS classes */})
      .on("mousedown", function(d){ /* De-register selected node */})
      .on("mouseup", function(d){ /* Register selected node */ });

    newGs.append("circle")
        .attr("r", String(thisGraph.zoomScale(thisGraph.scale)))
        .attr("stroke-width", thisGraph.nodeStrokeScale(thisGraph.scale) + "px");
    newGs.each(function(d){ thisGraph.insertNodeID(d3.select(this), d.title); });
    this.circles.exit().remove();
  };

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

