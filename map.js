var MapManager = function(globalState) {
    this.gs = globalState;

    // --------------------------------------- REPLACE WITH YOUR OWN TOKEN!!!------------------------------------------
    /**/ var token = "pk.eyJ1IjoibW5vb25lOTYiLCJhIjoiY2s4MGZjZ202MDB6MjNmbXh3eWNnYTlkaCJ9.tmdycTjo3Z40bwpTw3Xpgw"; /**/ 
    // ----------------------------------------------------------------------------------------------------------------

    var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + token;

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
    // streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr});

    this.map = L.map('map', {layers: [grayscale], zoomControl: false }).setView([53.347443, -6.262138], 13);
    // var baseLayers = {
    //     "Grayscale": grayscale,
    //     "Streets": streets
    // };

    // L.control.layers(baseLayers).addTo(this.map);

    /* Initialize the SVG layer */
    this.map._initPathRoot();
}

MapManager.prototype.GetMap = function(){ return this.map; }

