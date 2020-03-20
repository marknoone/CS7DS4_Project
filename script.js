// Operator Colours --------------------------------------------------------
const chartSize = 240;
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


async function addCharts() {
    // TODO: Get rid of titles?
    const hmData = await d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv");
    const scatterData = await d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_connectedscatter.csv")
    var hmSvg1 = d3.select('#heatChart1').append("svg").attr("width", chartSize).attr("height", chartSize);
    var hmSvg2 = d3.select('#heatChart2').append("svg").attr("width", chartSize).attr("height", chartSize);
    var hmSvg3 = d3.select('#heatChart3').append("svg").attr("width", chartSize).attr("height", chartSize);
    var hmSvg4 = d3.select('#heatChart4').append("svg").attr("width", chartSize).attr("height", chartSize);
    var hmSvg5 = d3.select('#heatChart5').append("svg").attr("width", chartSize).attr("height", chartSize);
    var hmSvg6 = d3.select('#heatChart6').append("svg").attr("width", chartSize).attr("height", chartSize);
    var hmSvg7 = d3.select('#heatChart7').append("svg").attr("width", chartSize).attr("height", chartSize);
    var hm1 = Heatmap(hmSvg1, chartSize, chartSize, hmData, "Test", "Testing a heatmap")
    var hm2 = Heatmap(hmSvg2, chartSize, chartSize, hmData, "Test", "Testing a heatmap")
    var hm3 = Heatmap(hmSvg3, chartSize, chartSize, hmData, "Test", "Testing a heatmap")
    var hm4 = Heatmap(hmSvg4, chartSize, chartSize, hmData, "Test", "Testing a heatmap")
    var hm5 = Heatmap(hmSvg5, chartSize, chartSize, hmData, "Test", "Testing a heatmap")
    var hm6 = Heatmap(hmSvg6, chartSize, chartSize, hmData, "Test", "Testing a heatmap")
    var hm7 = Heatmap(hmSvg7, chartSize, chartSize, hmData, "Test", "Testing a heatmap")
    
    var vaSvg1 = d3.select('#vehicleActivity1').append("svg").attr("width", chartSize).attr("height", chartSize);
    var vaSvg2 = d3.select('#vehicleActivity2').append("svg").attr("width", chartSize).attr("height", chartSize);
    var vaSvg3 = d3.select('#vehicleActivity3').append("svg").attr("width", chartSize).attr("height", chartSize);
    var vaSvg4 = d3.select('#vehicleActivity4').append("svg").attr("width", chartSize).attr("height", chartSize);
    var vaSvg5 = d3.select('#vehicleActivity5').append("svg").attr("width", chartSize).attr("height", chartSize);
    var vaSvg6 = d3.select('#vehicleActivity6').append("svg").attr("width", chartSize).attr("height", chartSize);
    var vaSvg7 = d3.select('#vehicleActivity7').append("svg").attr("width", chartSize).attr("height", chartSize);
    var va1 = ConnectedScatterPlot(vaSvg1, chartSize, chartSize, scatterData, "Test", "Testing a heatmap")
    var va2 = ConnectedScatterPlot(vaSvg2, chartSize, chartSize, scatterData, "Test", "Testing a heatmap")
    var va3 = ConnectedScatterPlot(vaSvg3, chartSize, chartSize, scatterData, "Test", "Testing a heatmap")
    var va4 = ConnectedScatterPlot(vaSvg4, chartSize, chartSize, scatterData, "Test", "Testing a heatmap")
    var va5 = ConnectedScatterPlot(vaSvg5, chartSize, chartSize, scatterData, "Test", "Testing a heatmap")
    var va6 = ConnectedScatterPlot(vaSvg6, chartSize, chartSize, scatterData, "Test", "Testing a heatmap")
    var va7 = ConnectedScatterPlot(vaSvg7, chartSize, chartSize, scatterData, "Test", "Testing a heatmap")
}

// MAIN --------------------------------------------------------------------
async function main(w, h){
    var gs = new GlobalState()

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
    var loc;
    nodes.forEach(function(d) {
        loc = [d.lat, d.lng];
        try{
            d.LatLng = new L.LatLng(loc[0], loc[1]);
        } catch(err) {
            console.log('error', d.LatLng, err)
        }
    })

    // Each edge must have their trip encoded for simulation
    // Source edge is the owner
    var edges = [
        {source: nodes[1], target: nodes[0], children: []},
        {source: nodes[2], target: nodes[3]}
    ];

    

    var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibW5vb25lOTYiLCJhIjoiY2s4MGZjZ202MDB6MjNmbXh3eWNnYTlkaCJ9.tmdycTjo3Z40bwpTw3Xpgw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
        streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr});

    var map = L.map('map', {layers: [grayscale]}).setView([53.347443, -6.262138], 13);
    var baseLayers = {
        "Grayscale": grayscale,
        "Streets": streets
    };

    L.control.layers(baseLayers).addTo(map);
				
	/* Initialize the SVG layer */
	map._initPathRoot()    

	/* We simply pick up the SVG from the map object */
	var svg = d3.select("#map").select("svg"),
	g = svg.append("g");

    var graph = new NetworkGraph(gs, g, nodes, edges, opColours, map);
    gs.SetNetworkGraph(graph);
    
    // var charts = new ChartManager(gs);
    // gs.SetChartManager(charts);

    // var ui = new UIManager(gs);
    // gs.SetUI(ui)

    await addCharts(); // TODO: Move into chart manager.


    // Begin simulation
    gs.Update();
    gs.ClearTimeout();
}



var document = document.documentElement,
    body = document.getElementsByTagName('body')[0];

var width = window.innerWidth || document.clientWidth || body.clientWidth,
height =  window.innerHeight|| document.clientHeight|| body.clientHeight;

main(width, height);