const FILTER_OPTIONS = Object.freeze({
    BUS_EIREANN: "e638a15b-8a8d-468e-8863-bdc14285b8e3",
    DUBLIN_BUS:  "f5459d13-346d-41f4-b1ba-4435d82eacdb",
    IRISH_RAIL:  "caeb6d99-5036-4c95-8d84-fbee3d8d927b",
    GO_AHEAD:    "bd79d6c0-a323-45ff-b8ce-66d413560a81",
    LUAS:        "f2711938-b24d-4fc1-bcd6-91eb0cda8de5"
});

const SIM_SPEED = [-16, -4, -2, -1, 1, 2, 4, 16]

var GlobalState = function(){
    // State Components
    this.dataManager  = null;
    this.networkGraph = null;
    this.chartManager = null;
    this.ui           = null;
    this.mapManager   = null;
    
    // State vars
    this.simTimeout = null;
    this.activeStopID = "luas:822GA00058";
    this.isLoading = true; // TODO: Loading screen
    this.isPaused = true;
    this.time = new Date().getTime(),
    this.simTime = new Date(),
    this.speedIdx = 4;
    this.busCount = 0;
    this.trainCount = 0;
    this.tramCount = 0;
    this.filters = {
        showBE:   true,
        showIR:   true,
        showDB:   true,
        showGAD:  true,
        showLUAS: true
    }
};

// Simulation Funcs
GlobalState.prototype.ClearTimeout = function(){
    clearTimeout(this.simTimeout);
    this.simTimeout = null;
};

GlobalState.prototype.Update = function(){
    this.ui.UpdateClock(); // Keep clock up do date.
    
    var thisState = this, last = this.time, 
        curr = new Date().getTime(), speedMS = 1000/SIM_SPEED[this.speedIdx];
    if(curr - last < Math.abs(speedMS) || this.isPaused){
        this.simTimeout = setTimeout((function(){ this.Update(); }).bind(this), 34);
        return;
    }
    
    // 1. Calculate new time..
    console.log(speedMS);
    this.time = curr;
    this.simTime.setTime(this.simTime.getTime() + (1000 * Math.sign(SIM_SPEED[this.speedIdx]) ));
    this.ui.UpdateSimClock(); // Keep clock up do date.

    // 2. Fetch data for time..
    // 3. Push time to UI..
    // 4. Push time to graph..
    // this.networkGraph.updateGraph();
    this.simTimeout = setTimeout((function(){ this.Update(); }).bind(this), 34);
}

// Getters/Setters ( Components ) 
GlobalState.prototype.GetUI = function(){ return this.ui; };
GlobalState.prototype.SetUI = function(ui){ 
    if (ui !== null) {
        this.ui = ui;
    }
};

GlobalState.prototype.GetChartManager = function(){ return this.chartManager; };
GlobalState.prototype.SetChartManager = function(chartManager){ 
    if (chartManager !== null) {
        this.chartManager = chartManager;
    }
};

GlobalState.prototype.GetNetworkGraph = function(){ return this.networkGraph; };
GlobalState.prototype.SetNetworkGraph = function(networkGraph){ 
    if (networkGraph !== null) {
        this.networkGraph = networkGraph;
    }
};

GlobalState.prototype.GetMapManager = function(){ return this.mapManager; };
GlobalState.prototype.SetMapManager = function(mapManager){ 
    if (mapManager !== null) {
        this.mapManager = mapManager;
    }
};

GlobalState.prototype.GetDataManager = function(){ return this.dataManager; };
GlobalState.prototype.SetDataManager = function(dataManager){ 
    if (dataManager !== null) {
        this.dataManager = dataManager;
    }
};


// Getters/Setters ( Vars ) 
GlobalState.prototype.GetIsPaused = function(){ return this.isPaused; }
GlobalState.prototype.TogglePause = function(){this.isPaused = !this.isPaused; this.ui.UpdatePlayPauseBtn();}

GlobalState.prototype.GetSimTime = function(){ return this.simTime; };
GlobalState.prototype.GetSimSpeed = function(){ return SIM_SPEED[this.speedIdx]; };
GlobalState.prototype.IncSpeed = function(){
    if(this.speedIdx < SIM_SPEED.length-1) {
        this.speedIdx++;
        this.ui.UpdateSimSpeed(SIM_SPEED[this.speedIdx]);
    }
};
GlobalState.prototype.DecSpeed = function(){ 
    if(this.speedIdx > 0) {
        this.speedIdx--;
        this.ui.UpdateSimSpeed(SIM_SPEED[this.speedIdx]);
    }
};

GlobalState.prototype.GetTrains = function(){ return this.trainCount; };
GlobalState.prototype.SetTrains = function(trainCount){ 
    if (trainCount !== null) {
        this.trainCount = trainCount;
        this.ui.UpdateTrainCount(this.trainCount);
    }
};

GlobalState.prototype.GetTrams = function(){ return this.tramCount; };
GlobalState.prototype.SetTrams = function(tramCount){ 
    if (tramCount !== null) {
        this.tramCount = tramCount;
        this.ui.UpdateTramCount(this.tramCount);
    }
};

GlobalState.prototype.GetBuses = function(){ return this.busCount; };
GlobalState.prototype.SetBuses = function(busCount){ 
    if (busCount !== null) {
        this.busCount = busCount;
        this.ui.UpdateBusCount(this.busCount);
    }
};

GlobalState.prototype.GetIsLoading = function(){ return this.isLoading; };
GlobalState.prototype.SetIsLoading = function(isLoading){ 
    if (isLoading !== null) {
        this.isLoading = isLoading;
    }
};

GlobalState.prototype.GetActiveStopID = function(){ return this.activeStopID; };
GlobalState.prototype.SetActiveStopID = function(activeStopID){ 
    if (activeStopID !== "" || activeStopID !== null) {
        this.activeStopID = activeStopID;
    }
};

GlobalState.prototype.GetFilters = function(){ return this.filters; };
GlobalState.prototype.SetFilters = function(filter, value){ 
    switch(filter){
        case FILTER_OPTIONS.BUS_EIREANN:
            this.filters.showBE = value; break;
        case FILTER_OPTIONS.DUBLIN_BUS:
            this.filters.showDB = value; break;
        case FILTER_OPTIONS.IRISH_RAIL:
            this.filters.showIR = value; break;
        case FILTER_OPTIONS.GO_AHEAD:
            this.filters.showGAD = value; break;
        case FILTER_OPTIONS.LUAS:
            this.filters.showLUAS = value; break;
        default:
    }
    
    this.networkGraph.UpdateFilters(this.filters);
};