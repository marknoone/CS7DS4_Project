// The following NEtwork graph is an adapted graph from:
// https://bl.ocks.org/cjrd/6863459

// ------------------------------------------------------------
// ----------------------- Constructor ------------------------
// ------------------------------------------------------------
var NetworkGraph = function(svg, nodes, edges){
    this.nodes = nodes || [];
    this.edges = edges || [];
    this.state = {
        selectedNode: null,
        selectedEdge: null,
        mouseDownNode: null,
        mouseDownLink: null,
        isZoomBehaviourActive: false,
        lastKeyDown: -1
    };

    var defs = svg.append('svg:defs');
    defs.append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', "32")
      .attr('markerWidth', 3.5)
      .attr('markerHeight', 3.5)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

    // define arrow markers for leading arrow
    defs.append('svg:marker')
      .attr('id', 'mark-end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 7)
      .attr('markerWidth', 3.5)
      .attr('markerHeight', 3.5)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

    this.svg = svg;
    var svgG = this.svgG = svg.append("g")
        .classed("graph", true);
    
    this.paths = svgG.append("g").selectAll("g"); // Path subgraph
    this.circles = svgG.append("g").selectAll("g"); // Edge subgraph

    // Register zoom behaviour callbacks
    var thisGraph = this;
    this.svg.call(d3.zoom()
        .on("zoom", function(){
            thisGraph.zoomed.call(thisGraph);
        })
        .on("start", function(){
            d3.select('body').style("cursor", "move");
         })
        .on("end", function(){
            d3.select('body').style("cursor", "auto");
        }))
        .on("dblclick.zoom", null);

    // Register callbacks for mouse/key events
    this.svg.on("mousedown", function(d){this.svgMouseDown.call(this, d);});
    this.svg.on("mouseup", function(d){this.svgMouseUp.call(this, d);});
    d3.select(window)
        .on("keydown", function(){ this.svgKeyDown.call(this); })
        .on("keyup", function(){ this.svgKeyUp.call(this); });

    window.onresize = function(){this.updateWindow(this.svg);};    
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
    ENTER_KEY: 13,
    nodeRadius: 50
  };


// ------------------------------------------------------------
// --------------------- Prototype Funcs ----------------------
// ------------------------------------------------------------
NetworkGraph.prototype.zoomed = function(){
    this.state.isZoomBehaviourActive = true;
    d3.select("." + this.consts.graphClass)
      .attr("transform", d3.event.transform); 
};
 
NetworkGraph.prototype.updateWindow = function(svg){
    var document = document.documentElement,
            body = document.getElementsByTagName('body')[0];

    var width  = window.innerWidth || document.clientWidth || body.clientWidth,
        height =  window.innerHeight|| document.clientHeight|| body.clientHeight;
    svg.attr("width", width).attr("height", height);
};

NetworkGraph.prototype.insertNodeID = function (gEl, title) {
    var words = title.split(/\s+/g),
        nwords = words.length;
    var el = gEl.append("text")
          .attr("text-anchor","middle")
          .attr("dy", "-" + (nwords-1)*7.5);

    for (var i = 0; i < words.length; i++) {
      var tspan = el.append('tspan').text(words[i]);
      if (i > 0)
        tspan.attr('x', 0).attr('dy', '15');
    }
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
    this.paths.style('marker-end', 'url(#end-arrow)')
      .classed(consts.selectedClass, function(d){
        return d === state.selectedEdge;
      })
      .attr("d", function(d){
        return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
      });

    this.paths.enter()
      .append("path")
      .style('marker-end','url(#end-arrow)')
      .classed("link", true)
      .attr("d", function(d){
        return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
      });

    this.paths.exit().remove();
    
    // Update nodes ..........................................
    this.circles = this.circles.data(this.nodes, function(d){ return d.id;});
    this.circles.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";});
    var newGs= this.circles.enter()
          .append("g");

    newGs.classed(consts.circleGClass, true)
      .attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})
      .on("mouseover", function(d){ /* Adjust CSS classes */ })
      .on("mouseout", function(d){ /* Adjust CSS classes */})
      .on("mousedown", function(d){ /* De-register selected node */})
      .on("mouseup", function(d){ /* Register selected node */ });

    newGs.append("circle").attr("r", String(consts.nodeRadius));
    newGs.each(function(d){ thisGraph.insertNodeID(d3.select(this), d.title); });
    this.circles.exit().remove();
  };

  