// Global Vars
// const minLat, maxLat;
// const minLng, maxLng;

// Build up data structures 
//d3.csv("assets/gtfs/luas/stops.csv").then(function(data){
    //data[]
//});

function drawDebug() {

}

// Define render-loop
function render() {
    // Cull any nodes not present
    // Get position of active vehicle along each route link
    //
}

function adjustZoom(target){
    // Change zoom
    // Collapse nodes close to each other
    //  - Average data between all nodes being collapsed 
}


/**** MAIN ****/
var document = document.documentElement,
body = document.getElementsByTagName('body')[0];

var width = window.innerWidth || document.clientWidth || body.clientWidth,
height =  window.innerHeight|| document.clientHeight|| body.clientHeight;

var xLoc = width/2 - 25,
      yLoc = 100;

var nodes = [{title: "new concept", id: 0, x: xLoc, y: yLoc},
               {title: "new concept", id: 1, x: xLoc, y: yLoc + 200}];
var edges = [{source: nodes[1], target: nodes[0]}];

var svg = d3.select('#animation')
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var graph = new NetworkGraph(svg, nodes, edges);
graph.updateGraph();
