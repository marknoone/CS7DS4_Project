// Build up data structures 
//d3.csv("assets/gtfs/luas/stops.csv").then(function(data){
    //data[]
//});

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

var nodes = [
    {title: "St.Stephen's Green", id: "822GA00058", lat: "53.339128708973", lng: "-6.26111748798404"},
    {title: "Harcourt", id: "822GA00062", lat: "53.3336509121028", lng: "-6.26269173695206"},
    {title: "Charlemont", id: "822GA00070", lat: "53.3306152452483", lng: "-6.25853598870766"},
];

var edges = [{source: nodes[1], target: nodes[0]}];

var svg = d3.select('#animation')
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var graph = new NetworkGraph(svg, nodes, edges);
graph.updateGraph();
