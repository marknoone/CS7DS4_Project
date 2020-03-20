const FILTER_OPTIONS = {
    BUS_EIREANN: {},
    DUBLIN_BUS:  {},
    IRISH_RAIL:  {},
    GO_AHEAD:    {},
    LUAS:        {}
}

var GlobalState = function(){
    // State Components
    this.networkGraph = null;
    this.chartManager = null;
    this.ui           = null;
    
    // State vars
    this.simTimeout = null;
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

// TODO: Test empty object on setter...
GlobalState.prototype.GetFilters = function(){ return this.filters; };
GlobalState.prototype.SetFilters = function(filter, value){ 
    switch(filter){
        case FILTER_OPTIONS.BUS_EIREANN:
            this.filters.showBE = value;
        case FILTER_OPTIONS.DUBLIN_BUS:
            this.filters.showDB = value;
        case FILTER_OPTIONS.IRISH_RAIL:
            this.filters.showIR = value;
        case FILTER_OPTIONS.GO_AHEAD:
            this.filters.showGAD = value;
        case FILTER_OPTIONS.LUAS:
            this.filters.showLUAS = value;
        default:
    }
    
    this.networkGraph.UpdateFilters(this.filters);
};