// Transit Vehicle Mode Types
const TRANSIT_TYPE = Object.freeze({
    TRAM:  "1930be94-05b3-4ebd-9bcc-3ba5059ccdef",
    TRAIN: "a499970b-d81d-4a74-8437-d03070c96ad6",
    BUS:   "67453a32-a535-4d0f-9825-ceb369d01739"
});

// Filepaths for GTFS files
const  opInfo = {
    "LUAS": { path: "assets/gtfs/luas/", tag:"luas", mode: TRANSIT_TYPE.TRAM },
    // "GAD": { path: "assets/gtfs/goahead/", tag:"goahead"},
    // "DUB": { path: "assets/gtfs/dublinbus/", tag:"dublinbus"},
    // "IR":  { path: "assets/gtfs/irishrail/", tag:"irishrail"},
    // "BE":  { path: "assets/gtfs/buseireann/", tag:"buseireann"},
};


// DataManager is responsible for parsing data and building 
// data structures to provide data at each time tick
var DataManager = function(gs){
    this.gs             = gs; // Global state object binding. 
    this.stops          = {}; // Data opbjects present for charting.
    this.stopTimeTrips  = {}  // Stops and Times for each trip (vehicles) 
    this.services       = {}; // Operating services
}

DataManager.prototype.GetStops = function(){ return this.stops; }
DataManager.prototype.GetStop  = function(ID){
    if (this.stops == null) {
        console.error("GTFS not yet parsed.");
        return null;
    }
    return this.stops[ID];
}

DataManager.prototype.GetStopTimeTrips = function(){ return this.stopTimeTrips; }
DataManager.prototype.GetStopTimeTrip  = function(ID){
    if (this.stopTimeTrips == null) {
        console.error("GTFS not yet parsed.");
        return null;
    }
    return this.stopTimeTrips[ID];
}

DataManager.prototype.GetServices = function(){ return this.services; }
DataManager.prototype.GetService  = function(ID){
    if (this.services == null) {
        console.error("GTFS not yet parsed.");
        return null;
    }
    return this.services[ID];
}

DataManager.prototype.ParseGTFS = function(){
    Object.keys(opInfo).forEach(key => {
        // 1. Fetch data from disk...
        console.log("Parsing: " + opInfo[key].path);
        const calenderDateData  = await d3.csv(opInfo[key].path+"calendar_dates.csv");
        const calendarData      = await d3.csv(opInfo[key].path+"calendar.csv");
        const routeData         = await d3.csv(opInfo[key].path+"routes.csv");
        const stopData          = await d3.csv(opInfo[key].path+"stops.csv");
        const stopTimeData      = await d3.csv(opInfo[key].path+"stop_times.csv");
        const tripData          = await d3.csv(opInfo[key].path+"trips.csv");

        // 2. Create maps for quick lookup.
        var routeMap; routeData.forEach (function(r){ routeMap[(opInfo[key].tag + ":" + r.route_id)]=r; });
        var tripMap;  tripData.forEach (function(t){ tripMap[(opInfo[key].tag + ":" + t.trip_id)]=t; });
        

        // 3. Populate DataManager stops.
        stopData.forEach(function(s){ 
            this.stops[(opInfo[key].tag + ":" + s.stop_id)] = {
                // Information for nodes
                ID: s.stop_id,
                Name: s.stop_name,
                LatLng: {Lat: s.stop_lat, Lng: s.stop_lon},
                
                // Information for edges. To be populated below...
                ConnctedStops: {},
            };   
        });
        

        // 4. Populate DataManager stopTimes
        var prevStopID, prevTripID;
        stopTimeData.forEach(function(st){
            // Map by trip for vehicles
            if (!((opInfo[key].tag + ":" + st.trip_id) in this.stopTimeTrips))  
                this.stopTimeTrips[(opInfo[key].tag + ":" + st.trip_id)] = {startTime: st.arrival_time}; 
            
            this.stopTimeTrips[(opInfo[key].tag + ":" + st.trip_id)].endTime = st.departure_time; 
            this.stopTimeTrips[(opInfo[key].tag + ":" + st.trip_id)][st.stop_sequence] = {
                arrTime: st.arrival_time, depTime: st.departure_time, stopID: st.stop_id};
        
            // Populate stop operating routes
            var route = tripMap[(opInfo[key].tag + ":" + st.trip_id)].route_id;
            if(prevStopID && prevTripID === st.trip_id){
                if(!(st.stop_id in this.stops[(opInfo[key].tag + ":" + prevStopID)].ConnctedStops)){
                    this.stops[(opInfo[key].tag + ":" + prevStopID)]
                        .ConnctedStops[(opInfo[key].tag + ":" + st.stop_id)] = []
                }

               
                this.stops[(opInfo[key].tag + ":" + prevStopID)]
                    .ConnctedStops[(opInfo[key].tag + ":" + st.stop_id)].push({
                        RouteID: routeMap[(opInfo[key].tag + ":" + route)].route_short_name == ""?
                            routeMap[(opInfo[key].tag + ":" + route)].route_long_name:
                            routeMap[(opInfo[key].tag + ":" + route)].route_short_name, 
                        Mode: opInfo[key].mode 
                    });
            }
        
            prevTripID = st.trip_id;
            prevStopID = st.stop_id;
        });
        
        // 5. Populate DataManager Service Times
        var dates = util.GetDatesForWeek(new Date(2020, 03, 21));
        dates.forEach(function(d){
            this.services[util.ToGTFSDate(d)] = [];
            calendarData.forEach(function(cd){
                // Check if between specified dates & Calendar Date excpetions
                if (!util.IsDateBetweenGTFSDates(cd.start_date, cd.end_date)) {
                    if (util.GetCalendarDateOperation(calenderDateData, cd.service_id, d) === 1)                       
                    this.services[util.ToGTFSDate(d)].push((opInfo[key].tag + ":" + cd.service_id))
                    continue;
                }
                
                // Check Standard Schedule
                var isOperating = false;
			    switch (d.getUTCDay()) {
                case 0: isOperating = cal.Sunday;    break;
                case 1: isOperating = cal.Monday;    break;
                case 2: isOperating = cal.Tuesday;   break;
                case 3: isOperating = cal.Wednesday; break;
                case 4: isOperating = cal.Thursday;  break;
                case 5: isOperating = cal.Friday;    break;
                case 6: isOperating = cal.Saturday;  break;
                }
                
                // Add to map if operating
                if (util.GetCalendarDateOperation(calenderDateData, cd.service_id, d) !== 2 && isOperating) 
                    this.services[util.ToGTFSDate(d)].push((opInfo[key].tag + ":" + cd.service_id))
            });
        });
               
        console.log(this.services);
    });
}

DataManager.prototype.CalculateStopChartData = function(){
    // TODO: Calculate chart info.
    // Information for charts
    // Heatmap:                [{route: "", values: [{time: "", value: ""}] }],
    // ConnectedScatterPlot:   [{route: "", values: [{time: "", value: ""}] }],
};

