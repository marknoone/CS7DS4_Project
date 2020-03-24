// Transit Vehicle Mode Types
const TRANSIT_TYPE = Object.freeze({
    TRAM:  "1930be94-05b3-4ebd-9bcc-3ba5059ccdef",
    TRAIN: "a499970b-d81d-4a74-8437-d03070c96ad6",
    BUS:   "67453a32-a535-4d0f-9825-ceb369d01739"
});

// Filepaths for GTFS files
const opInfo = {
    "LUAS": { path: "assets/gtfs/luas/",        tag:"luas",         mode: TRANSIT_TYPE.TRAM },
    "GAD":  { path: "assets/gtfs/goahead/",     tag:"goahead",      mode: TRANSIT_TYPE.BUS},
    "DUB":  { path: "assets/gtfs/dublinbus/",   tag:"dublinbus",    mode: TRANSIT_TYPE.BUS},
    "IR":   { path: "assets/gtfs/irishrail/",   tag:"irishrail",    mode: TRANSIT_TYPE.TRAIN},
    "BE":   { path: "assets/gtfs/buseireann/",  tag:"buseireann",   mode: TRANSIT_TYPE.BUS},
};

// TODO: Remove to stop maintaining two consts, Key above should be tag
const tagMap = {
    "luas":       { op: "LUAS",     tag:"luas",         mode: TRANSIT_TYPE.TRAM  },      
    "goahead":    { op: "GAD",      tag:"goahead",      mode: TRANSIT_TYPE.BUS   },   
    "dublinbus":  { op: "DUB",      tag:"dublinbus",    mode: TRANSIT_TYPE.BUS   }, 
    "irishrail":  { op: "IR",       tag:"irishrail",    mode: TRANSIT_TYPE.TRAIN }, 
    "buseireann": { op: "BE",       tag:"buseireann",   mode: TRANSIT_TYPE.BUS   },
}

// Optional route colours
const colours = ["#EDC951","#CC333F","#00A0B0"];

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

DataManager.prototype.GetStopCharts = function(){ return this.chartData; }
DataManager.prototype.GetStopChart  = function(ID){
    if (this.chartData == null) {
        console.error("GTFS not yet parsed.");
        return null;
    }
    return this.chartData[ID];
}

DataManager.prototype.GetStops = function(){ return this.stops; }
DataManager.prototype.GetStop  = function(ID){
    if (this.stops == null) {
        console.error("GTFS not yet parsed.");
        return null;
    }
    return this.stops[ID];
}

DataManager.prototype.GetRoutes = function(){ return this.routeMap; }
DataManager.prototype.GetRoute  = function(ID){
    if (this.routeMap == null) {
        console.error("GTFS not yet parsed.");
        return null;
    }
    return this.routeMap[ID];
}

DataManager.prototype.GetTrips = function(){ return this.tripMap; }
DataManager.prototype.GetTrip  = function(ID){
    if (this.tripMap == null) {
        console.error("GTFS not yet parsed.");
        return null;
    }
    return this.tripMap[ID];
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

DataManager.prototype.ParseGTFS = async function(op, cb){
    var thisDM = this;
    var key = op;

    // 1. Fetch data from disk...
    console.log("Parsing: " + opInfo[key].path);
    const calenderDateData  = await d3.csv(opInfo[key].path+"calendar_dates.csv");
    const calendarData      = await d3.csv(opInfo[key].path+"calendar.csv");
    const routeData         = await d3.csv(opInfo[key].path+"routes.csv");
    const stopData          = await d3.csv(opInfo[key].path+"stops.csv");
    const stopTimeData      = await d3.csv(opInfo[key].path+"stop_times.csv");
    const tripData          = await d3.csv(opInfo[key].path+"trips.csv");

    // 2. Create maps for quick lookup.
    routeData.forEach (function(r){ thisDM.routeMap[(opInfo[key].tag + ":" + r.route_id)]=r; });
    tripData.forEach (function(t){ thisDM.tripMap[(opInfo[key].tag + ":" + t.trip_id)]=t; });
    

    // 3. Populate DataManager stops.
    stopData.forEach(function(s){ 
        thisDM.stops[(opInfo[key].tag + ":" + s.stop_id)] = {
            // Information for nodes
            ID: (opInfo[key].tag + ":" + s.stop_id),
            Name: s.stop_name,
            LatLng: {Lat: s.stop_lat, Lng: s.stop_lon},
            
            // Information for edges. To be populated below...
            ConnectedStops: {},
            ArrDep:    {},
        };   
    });
    

    // 4. Populate DataManager stopTimes
    var prevStopID = "", prevTripID = "";
    stopTimeData.forEach(function(st){
        // Map by trip for vehicles
        if (!((opInfo[key].tag + ":" + st.trip_id) in thisDM.stopTimeTrips))  
            thisDM.stopTimeTrips[(opInfo[key].tag + ":" + st.trip_id)] = {startTime: st.arrival_time}; 
        
        thisDM.stopTimeTrips[(opInfo[key].tag + ":" + st.trip_id)].endTime = st.departure_time; 
        thisDM.stopTimeTrips[(opInfo[key].tag + ":" + st.trip_id)][(st.arrival_time+"-"+st.departure_time)] =  {
            StopID:(opInfo[key].tag + ":" + st.stop_id), Seq: st.stop_sequence};
            
        // Keep track of all stop departures (for chart data)
        var route = thisDM.tripMap[(opInfo[key].tag + ":" + st.trip_id)].route_id;
        thisDM.stops[(opInfo[key].tag + ":" + st.stop_id)]
            .ArrDep[(st.arrival_time + "-" + st.departure_time)] = route;
            
        // Populate stop operating routes
        var getRoute = function(route){
            return thisDM.routeMap[(opInfo[key].tag + ":" + route)].route_short_name == ""?
                    thisDM.routeMap[(opInfo[key].tag + ":" + route)].route_long_name:
                    thisDM.routeMap[(opInfo[key].tag + ":" + route)].route_short_name;
        }

        if(prevStopID !== "" && prevTripID === st.trip_id){
            if(!(st.stop_id in thisDM.stops[(opInfo[key].tag + ":" + prevStopID)].ConnectedStops)){
                thisDM.stops[(opInfo[key].tag + ":" + prevStopID)]
                    .ConnectedStops[(opInfo[key].tag + ":" + st.stop_id)] = []
            }
            
            thisDM.stops[(opInfo[key].tag + ":" + prevStopID)]
                .ConnectedStops[(opInfo[key].tag + ":" + st.stop_id)].push({
                    RouteID:  getRoute(route), Mode: opInfo[key].mode });
        }
    
        prevTripID = st.trip_id;
        prevStopID = st.stop_id;
    });
    
    // 5. Populate DataManager Service Times
    var dates = util.GetDatesForWeek(new Date(2020, 03, 21));
    dates.forEach(function(d){
        thisDM.services[util.ToGTFSDate(d)] = [];
        calendarData.forEach(function(cd){
            // Check if between specified dates & Calendar Date excpetions
            if (!util.IsDateBetweenGTFSDates(d, cd.start_date, cd.end_date)) {
                if (util.GetCalendarDateOperation(calenderDateData, cd.service_id, d) === 1)                       
                    thisDM.services[util.ToGTFSDate(d)].push((opInfo[key].tag + ":" + cd.service_id))
                return;
            }
            
            // Check Standard Schedule
            var isOperating = false;
            switch (d.getDay()) {
            case 0: isOperating = cd.sunday    == 1; break;
            case 1: isOperating = cd.monday    == 1; break;
            case 2: isOperating = cd.tuesday   == 1; break;
            case 3: isOperating = cd.wednesday == 1; break;
            case 4: isOperating = cd.thursday  == 1; break;
            case 5: isOperating = cd.friday    == 1; break;
            case 6: isOperating = cd.saturday  == 1; break;
            }
            
            // Add to map if operating
            if (util.GetCalendarDateOperation(calenderDateData, cd.service_id, d) !== 2 && isOperating) 
                thisDM.services[util.ToGTFSDate(d)].push((opInfo[key].tag + ":" + cd.service_id))
        });
    });

    console.log("Parsing Completed.")
    this.CalculateStopChartData(cb);
}

DataManager.prototype.CalculateStopChartData = function(cb){
    var thisDM = this;

    var isEmpty = function(obj){return Object.keys(obj).length === 0 && obj.constructor === Object}
    if (!isEmpty(this.chartData)) return;
    if (isEmpty(this.stops)){
        console.error("Chart Err: A GTFS dataset must first be parsed.")
        return
    }

    var getSecondsFromKey = function(key){ 
        [arrTime, depTime] = key.split("-");
        var arrival = arrTime.split(":"), departure = depTime.split(":"); 
        var aMinutes = (parseInt(arrival[0]) * 60) +parseInt(arrival[1]),
            bMinutes = (parseInt(departure[0]) * 60) +parseInt(departure[1]);
        
        return [ 
            parseInt(arrival[0]),
            (aMinutes * 60) + parseInt(arrival[2]),
            (bMinutes * 60) + parseInt(departure[2])
        ];
    }

    
    Object.keys(this.stops).forEach(function(key){
        var results = {}, s = thisDM.stops[key], maxVehicleCount = 0;

        // Calculate dat into results
        Object.keys(s.ArrDep).forEach(function(k){
            [arrHours, arrTime, depTime] = getSecondsFromKey(k);
            if(!(s.ArrDep[k] in results)) results[s.ArrDep[k]] = {}
            if(!(arrHours in results[s.ArrDep[k]])) 
                results[s.ArrDep[k]][arrHours] = {deps: {}, AvgWait: 0, VehicleCount: 0 };

            results[s.ArrDep[k]][arrHours].deps[depTime] = {};
            if (Object.keys(results[s.ArrDep[k]][arrHours].deps).length > maxVehicleCount)
                maxVehicleCount = Object.keys(results[s.ArrDep[k]][arrHours].deps).length;
        });

        // Finalize AvgWait 
        Object.keys(results).forEach((k) => Object.keys(results[k]).forEach((tKey) => {
                var t = results[k][tKey];

                var lastTime = Object.keys(t.deps)[0], diffs = [];
                Object.keys(t.deps).forEach((depKey, i) => { 
                    if (i === 0) return
                    diffs.push(depKey - lastTime);
                    lastTime = depKey;
                })
                var total = diffs.reduce((a, b) => a + b, 0)
                t.VehicleCount = Object.keys(t.deps).length;
                t.AvgWait = total / Object.keys(t.deps).length;
                t.RouteSharePerc = t.VehicleCount / maxVehicleCount;
        }));

        // Place into chart data
        var routes = Object.keys(results);
        thisDM.chartData[key] = { 
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
            RadarChart: routes.map(function(r, i){ 
                return { route: r, values: Object.keys(results[r]).map(function(t){
                    return { time: t, colour: colours[i], value: results[r][t].RouteSharePerc };
                })}
            })
        }
    });

    console.log("Chart data calculated.")
    cb();
};

