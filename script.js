// Operator Colours --------------------------------------------------------
const opColours = { 
    LUAS: "#6237A1", // Luas
    GAD:  "#00A7DF", // Go Ahead
    DUB:  "#FDCA01", // Dublin Bus
    IR:   "#32A441", // Irish Rail
    BE:   "#CD1C38"  // Bus Eireann
}

var paths = {
    "LUAS": "assets/gtfs/luas",
    // "GAD":  "assets/gtfs/goahead",
    // "DUB":  "assets/gtfs/dublinbus",
    // "IR":   "assets/gtfs/irishrail",
    // "BE":   "assets/gtfs/buseireann",
}



// MAIN --------------------------------------------------------------------
async function main(w, h){
    var nodes = [];
    const luas = await d3.csv(paths["LUAS"] + "/stops.csv");
    luas.forEach( stop => {
    
        // TODO: push segment congestion data into node
        nodes.push({
            title: stop.stop_name, 
            id: stop.stop_id, 
            lat: stop.stop_lat, 
            lng: stop.stop_lon, 
            operator: "LUAS",
        })
    })

    // Each edge must have their trip encoded for simulation
    // Source edge is the owner
    var edges = [
        {source: nodes[1], target: nodes[0]},
        {source: nodes[2], target: nodes[3]}
    ];

    var svg = d3.select('#animation')
        .append("svg")
        .attr("width", w)
        .attr("height", h);
    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#ddd");

    var graph = new NetworkGraph(svg, nodes, edges, opColours);
    graph.updateGraph();
}

var document = document.documentElement,
    body = document.getElementsByTagName('body')[0];

var width = window.innerWidth || document.clientWidth || body.clientWidth,
height =  window.innerHeight|| document.clientHeight|| body.clientHeight;

main(width, height);