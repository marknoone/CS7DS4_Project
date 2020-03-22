const FILTER_OPTIONS = Object.freeze({
    BUS_EIREANN: "e638a15b-8a8d-468e-8863-bdc14285b8e3",
    DUBLIN_BUS:  "f5459d13-346d-41f4-b1ba-4435d82eacdb",
    IRISH_RAIL:  "caeb6d99-5036-4c95-8d84-fbee3d8d927b",
    GO_AHEAD:    "bd79d6c0-a323-45ff-b8ce-66d413560a81",
    LUAS:        "f2711938-b24d-4fc1-bcd6-91eb0cda8de5"
});

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
    this.busCount = 0;
    this.trainCount = 0;
    this.tramCount = 0;
    this.simTime = 0;
    this.speed = 1
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
    // 1. Calculate new time..
    // 2. Fetch data for time..
    // 3. Push time to UI..
    // 4. Push time to graph..
    this.networkGraph.updateGraph();
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
GlobalState.prototype.GetSpeed = function(){ return this.speed; };
GlobalState.prototype.SetSpeed = function(speed){ 
    if (speed !== null) {
        this.speed = speed;
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