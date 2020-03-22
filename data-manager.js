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
    this.stopTimeTrips  = {}; // Stops and Times for each trip (vehicles) 
    this.routeMap       = {}; // Contains all route info by RouteID
    this.tripMap        = {}; // Contains all trip info by TripID
    this.services       = {}; // Operating services
    this.chartData      = {}; // Data precomputed for chart lookup.
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

DataManager.prototype.ParseGTFS = async function(){
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
        this.routeMap; routeData.forEach (function(r){ this.routeMap[(opInfo[key].tag + ":" + r.route_id)]=r; });
        this.tripMap;  tripData.forEach (function(t){ this.tripMap[(opInfo[key].tag + ":" + t.trip_id)]=t; });
        

        // 3. Populate DataManager stops.
        stopData.forEach(function(s){ 
            this.stops[(opInfo[key].tag + ":" + s.stop_id)] = {
                // Information for nodes
                ID: s.stop_id,
                Name: s.stop_name,
                LatLng: {Lat: s.stop_lat, Lng: s.stop_lon},
                
                // Information for edges. To be populated below...
                ConnctedStops: {},
                Departures:    {},
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
                
            // Keep track of all stop departures (for chart data)
            var route = this.tripMap[(opInfo[key].tag + ":" + st.trip_id)].route_id;
            this.stops[(opInfo[key].tag + ":" + st.stop_id)]
                .ArrDep[(st.arrival_time + "-" + st.departure_time)] = route;
                
            // Populate stop operating routes
            var getRoute = function(route){
                return this.routeMap[(opInfo[key].tag + ":" + route)].route_short_name == ""?
                            this.routeMap[(opInfo[key].tag + ":" + route)].route_long_name:
                            this.routeMap[(opInfo[key].tag + ":" + route)].route_short_name;
            }

            if(prevStopID && prevTripID === st.trip_id){
                if(!(st.stop_id in this.stops[(opInfo[key].tag + ":" + prevStopID)].ConnctedStops)){
                    this.stops[(opInfo[key].tag + ":" + prevStopID)]
                        .ConnctedStops[(opInfo[key].tag + ":" + st.stop_id)] = []
                }
               
                this.stops[(opInfo[key].tag + ":" + prevStopID)]
                    .ConnectedStops[(opInfo[key].tag + ":" + st.stop_id)].push({
                        RouteID:  getRoute(route), Mode: opInfo[key].mode });
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

DataManager.prototype.CalculateStopChartData = function(stopID){
    var isEmpty = function(obj){return Object.keys(obj).length === 0 && obj.constructor === Object}
    if (!isEmpty(this.chartData)) return;
    if (isEmpty(this.stops) || isEmpty(this.stopsData)){
        console.error("Chart Err: A GTFS dataset must first be parsed.")
        return
    }

    var getOrigID = function(s){ return s.split(":")[1]}
    var getSeconds = function(a){ 
        var minutes = (a.getUTCHours() * 60) + a.getUTCMinutes();
        return (minutes * 60) + a.getUTCSeconds();
    }
    var getTimesFromKey = function(key){ 
        [arrTime, depTime] = k.split("-");
        var arrival = arrTime.split(":"), departure = depTime.split(":"); 
        if (arrival[0] === "24" ) arrival[0] = "0"; 
        if (departure[0] === "24" ) departure[0] = "0"; 
        return [ 
            new Date(0, 0, 0, arrival[0], arrival[1], arrival[2], 0),
            new Date(0, 0, 0, departure[0], departure[1], departure[2], 0)
        ];
    }

    
    this.stops.forEach(function(s){
        var results = {};

        // Calculate dat into results
        Object.keys(s.ArrDep).forEach(function(k){
            [arrTime, depTime] = getTimesFromKey(k);
            if(!(s.ArrDep[k] in results)) results[s.ArrDep[k]] = {}
            if(!(arrTime.getHours() in results[s.ArrDep[k]])) 
                results[s.ArrDep[k]][arrTime.getHours()] = {
                    lastTime: 0, AvgWait: 0, VehicleCount: 0 };

            var last = results[s.ArrDep[k]][arrTime.getHours()].lastTime;
            var diff = getSeconds(depTime) - getSeconds(last);
            results[s.ArrDep[k]][arrTime.getHours()] = {
                lastTime: depTime,
                AvgWait: results[s.ArrDep[k]][arrTime.getHours()].AvgWait + diff,
                VehicleCount: results[s.ArrDep[k]][arrTime.getHours()].VehicleCount +1
            }
        });

        // Finalize AvgWait 
        Object.keys(results).forEach(k => Object.keys(results[k]).forEach(t => {
            results[k][t].AvgWait = results[k][t].AvgWait / results[k][t].VehicleCount;
        }));

        // Place into chart data
        var routes = Object.keys(results);
        this.chartData[s.ID] = { 
            Heatmap: routes.map(function(r){ 
                return { route: r, values: Object.keys(results[r]).map(function(t){
                    return { time: t, value: results[r][t].AvgWait };
                })}
            }), 
            ConnectedScatterPlot: routes.map(function(r){ 
                return { route: r, values: Object.keys(results[r]).map(function(t){
                    return { time: t, value: results[r][t].VehicleCount };
                })}
            }), 
            RadarChart: routes.map(function(r){ 
                return { route: r, values: Object.keys(results[r]).map(function(t){
                    return { time: t, value: results[r][t].VehicleCount };
                })}
            })
        }
    });
};

