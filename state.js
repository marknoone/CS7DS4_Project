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
    this.activeChartDay = 1;
    this.activeSlider = false;
    this.sliderTime = 0;
    
    // TODO: variable sim time
    this.simTime = new Date(2020, 03, 21, 16, 30, 00, 00),
    this.speedIdx = 4;
    this.busCount = 0;
    this.trainCount = 0;
    this.tramCount = 0;
    this.filters = {
        showBE:   false,
        showIR:   false,
        showDB:   false,
        showGAD:  false,
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
    if (this.activeSlider) {
        this.simTimeout = setTimeout((function(){ this.Update(); }).bind(this), 34);
        return
    }

    var thisState = this, last = this.time, 
        curr = new Date().getTime(), speedMS = 1000/SIM_SPEED[this.speedIdx];
    if(curr - last < Math.abs(speedMS) || this.isPaused){
        this.simTimeout = setTimeout((function(){ this.Update(); }).bind(this), 34);
        return;
    }
    
    this.sliderTime = this.ui.SetSliderTime(
        (this.simTime.getHours() * 60*60) + (this.simTime.getMinutes() *60) + this.simTime.getSeconds());
    this.time = curr;
    this.simTime.setTime(this.simTime.getTime() + (1000 * Math.sign(SIM_SPEED[this.speedIdx]) ));
    this.ui.UpdateSimClock(); // Keep clock up do date.
    this.networkGraph.UpdateVehicles();
    this.simTimeout = setTimeout((function(){ this.Update(); }).bind(this), 34);
}

// Getters/Setters ( Components ) 
GlobalState.prototype.GetUI = function(){ return this.ui; };
GlobalState.prototype.SetUI = function(ui){ 
    if (ui !== null) {
        this.ui = ui;
        this.ui.SetSliderTime(
            (this.simTime.getHours() * 60*60) + (this.simTime.getMinutes() *60) + this.simTime.getSeconds());
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

GlobalState.prototype.GetVehicleMetrics = function(){ 
    return {trainCount: this.trainCount, busCount: this.busCount, tramCount: this.tramCount}; };
GlobalState.prototype.SetVehicleMetrics = function(obj){ 
    var {trainCount, busCount, tramCount} = obj;
    if (trainCount !== null) { this.trainCount = trainCount; }
    if (busCount !== null)   { this.busCount = busCount; }
    if (tramCount !== null)  { this.tramCount = tramCount; }
    if (this.ui) this.ui.UpdateVehicleMetricsObj(obj);
};

GlobalState.prototype.GetActiveChartDay = function(){ return this.activeChartDay; };
GlobalState.prototype.SetActiveChartDay = function(day){ 
    if (day !== null) {
        this.activeChartDay = day;
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
    this.chartManager.UpdateCharts();
    this.ui.UpdateActiveStopLabel();
};

GlobalState.prototype.GetFilters = function(){ return this.filters; };
GlobalState.prototype.SetFilter = function(value, filter){ 
    console.log(value);
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
    
    this.networkGraph.UpdateFilters();
};

GlobalState.prototype.SetSlider = function(val) { 
    this.activeSlider = val; 
    if (val === false) {
        var tmp = this.ui.GetSliderTime();
        this.simTime = new Date(2020, 03, 21, 
            Math.floor(tmp/60/60), 
            Math.floor(tmp/60)%60, 
            tmp%60, 
            00
        );
        this.ui.UpdateSimClock();
    }
}