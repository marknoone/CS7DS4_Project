const shBtn = document.querySelector('#show-hide-btn');
const filterBtn = document.querySelector('#filter-btn');
const filterLayout = document.querySelector('#filter-layout');
const zoomPlusBtn = document.querySelector('#zoom-plus-btn');
const zoomMinusBtn = document.querySelector('#zoom-minus-btn');
const zoomLayout = document.querySelector('#zoom-layout');
const infoBtn = document.querySelector('#info-btn');
const infoLayout = document.querySelector('#info-layout');
const clock = document.querySelector('#clock');
const simClock = document.querySelector('#simClock');
const simSpeed = document.querySelector('#simSpeed');
const activeStopLabel = document.querySelector('#activeStopLabel');
const popup = document.getElementsByClassName('popup-layout')[0];

// Vehicle Metrics
const busMetric   = document.querySelector('#busMetric');
const trainMetric = document.querySelector('#trainMetric');
const tramMetric  = document.querySelector('#tramMetric');

// Speed Controls
const ffBtn = document.querySelector('#ffBtn');
const playPauseBtn = document.querySelector('#playPauseBtn');
const rewBtn = document.querySelector('#rewBtn');

// Toggles
const beToggle   = document.querySelector('#be-toggle');
const dubToggle  = document.querySelector('#dub-toggle');
const irToggle   = document.querySelector('#ir-toggle');
const gadToggle  = document.querySelector('#gad-toggle');
const luasToggle = document.querySelector('#luas-toggle');

// daySelect Buttons
// const dayCharts         = document.querySelector('#chart-container');
// const mondaySelect      = document.querySelector('#monday');
// const tuesdaySelect     = document.querySelector('#tuesday');
// const wednesdaySelect   = document.querySelector('#wednesday');
// const thursdaySelect    = document.querySelector('#thursday');
// const fridaySelect      = document.querySelector('#friday');
// const saturdaySelect    = document.querySelector('#saturday');
// const sundaySelect      = document.querySelector('#sunday');

var UIManager = function(gs){
    this.gs = gs;
    this.map = gs.GetMapManager().GetMap();
    this.state = {
        isInfoShowing: false,
        isFilterShowing: false,
        isPopupShowing: true
    }

    thisUI = this;
    // Change to update charts existing already in ChartManager.
    // sundaySelect.addEventListener('click',    function(e) { thisUI.ChangeActiveCharts(0) });
    // mondaySelect.addEventListener('click',    function(e) { thisUI.ChangeActiveCharts(1) });
    // tuesdaySelect.addEventListener('click',   function(e) { thisUI.ChangeActiveCharts(2) });
    // wednesdaySelect.addEventListener('click', function(e) { thisUI.ChangeActiveCharts(3) });
    // thursdaySelect.addEventListener('click',  function(e) { thisUI.ChangeActiveCharts(4) });
    // fridaySelect.addEventListener('click',    function(e) { thisUI.ChangeActiveCharts(5) });
    // saturdaySelect.addEventListener('click',  function(e) { thisUI.ChangeActiveCharts(6) });

    shBtn.addEventListener('click', function(e) {
        thisUI.state.isPopupShowing = !thisUI.state.isPopupShowing;
        thisUI.updateUI();  // TODO: Remove and place with render call
    });
    
    // filterBtn.addEventListener('click', function(e) {
    //     thisUI.state.isFilterShowing = !thisUI.state.isFilterShowing;
    //     thisUI.toggleActiveBtn(filterBtn)
    //     thisUI.updateUI(); // TODO: Remove and place with render call
    // });
    
    infoBtn.addEventListener('click', function(e) {
        thisUI.state.isInfoShowing = !thisUI.state.isInfoShowing;
        thisUI.toggleActiveBtn(infoBtn)
        thisUI.updateUI(); // TODO: Remove and place with render call
    });

    zoomPlusBtn.addEventListener('click', function(e) { thisUI.map.zoomIn(); });
    zoomMinusBtn.addEventListener('click', function(e) { thisUI.map.zoomOut(); });
    ffBtn.addEventListener('click', function(e) { thisUI.gs.IncSpeed(); });
    playPauseBtn.addEventListener('click', function(e) { thisUI.gs.TogglePause(); });
    rewBtn.addEventListener('click', function(e) { thisUI.gs.DecSpeed(); });

    // Filter toggles
    // beToggle.addEventListener('change',   (event) => thisUI.gs.SetFilter(event.target.checked, FILTER_OPTIONS.BUS_EIREANN));
    // dubToggle.addEventListener('change',  (event) => thisUI.gs.SetFilter(event.target.checked, FILTER_OPTIONS.DUBLIN_BUS));
    // irToggle.addEventListener('change',   (event) => thisUI.gs.SetFilter(event.target.checked, FILTER_OPTIONS.IRISH_RAIL));
    // gadToggle.addEventListener('change',  (event) => thisUI.gs.SetFilter(event.target.checked, FILTER_OPTIONS.GO_AHEAD));
    // luasToggle.addEventListener('change', (event) => thisUI.gs.SetFilter(event.target.checked, FILTER_OPTIONS.LUAS));

    // Start UI
    this.updateUI();
    this.UpdateClock();
    this.UpdateSimClock();
    this.UpdateSimSpeed();
    this.UpdatePlayPauseBtn();
    this.UpdateFilters();
    this.UpdateActiveStopLabel();
};

UIManager.prototype.toggleActiveBtn = function(el){
    if (el.classList.contains("active-btn")) {
        el.classList.remove("active-btn");
    } else {
        el.classList.add("active-btn");
    }
}

UIManager.prototype.toggleToggle = function(el){
    if (el.classList.contains("active-toggle")) {
        el.classList.remove("active-toggle");
    } else {
        el.classList.add("active-toggle");
    }
}

// Deprecated: Needs cleanup
UIManager.prototype.updateUI = function() {
    // Change button icon
    if (this.state.isPopupShowing) {
        shBtn.childNodes[0].className = "fas fa-angle-down";
        infoLayout.style.top = "58vh";
        infoBtn.style.top = "58vh";
        zoomLayout.style.top = "50vh";
    }
    else {
        shBtn.childNodes[0].className = "fas fa-angle-up";
        infoLayout.style.top = "90vh";
        infoBtn.style.top = "90vh";
        zoomLayout.style.top = "82vh";
    }
    
    // Set popup position
    if (this.state.isPopupShowing) 
        popup.style.bottom = "0px";
    else
        popup.style.bottom = "-424px";
    
    // if(this.state.isFilterShowing){
    //     filterLayout.style.opacity = 1
    //     setTimeout(function(){ filterLayout.style.visibility = "visible"; }, 150);
    // }
    // else {
    //     filterLayout.style.opacity = 0
    //     setTimeout(function(){ filterLayout.style.visibility = "hidden"; }, 150);
    // }
    
    if(this.state.isInfoShowing){
        infoLayout.style.opacity = 1
        setTimeout(function(){ infoLayout.style.visibility = "visible"; }, 150);
    }
    else {
        infoLayout.style.opacity = 0
        setTimeout(function(){ infoLayout.style.visibility = "hidden"; }, 150);
    }
}

UIManager.prototype.UpdateClock = function()
{
    var date = new Date()
    var mins = date.getMinutes() < 10 ? "0" + date.getMinutes(): date.getMinutes();
    var secs = date.getSeconds() < 10 ? "0" + date.getSeconds(): date.getSeconds();
    clock.innerHTML = date.getHours()+":"+mins+":"+secs+" (GMT)";
}

UIManager.prototype.UpdateSimClock = function()
{
    var date = this.gs.GetSimTime()
    var mins = date.getMinutes() < 10 ? "0" + date.getMinutes(): date.getMinutes();
    var secs = date.getSeconds() < 10 ? "0" + date.getSeconds(): date.getSeconds();
    simClock.innerHTML = date.getHours()+":"+mins+":"+secs;
}

UIManager.prototype.UpdateSimSpeed = function(){
    var speed = this.gs.GetSimSpeed();
    simSpeed.innerHTML = speed;
}

UIManager.prototype.UpdatePlayPauseBtn = function(){
    var isPaused = this.gs.GetIsPaused()
    playPauseBtn.innerHTML = isPaused? '<i class="fas fa-lg fa-play">':'<i class="fas fa-lg fa-pause">'
}

UIManager.prototype.UpdateFilters = function(){
    // var filters = this.gs.GetFilters();
    // beToggle.checked = filters.showBE;
    // dubToggle.checked = filters.showDB;
    // irToggle.checked = filters.showIR;
    // gadToggle.checked = filters.showGAD;
    // luasToggle.checked = filters.showLUAS;
}

UIManager.prototype.UpdateVehicleMetricsObj = function(obj){
    var {trainCount, busCount, tramCount} = obj;
    // busMetric.innerHTML = busCount;
    // trainMetric.innerHTML = trainCount;
    tramMetric.innerHTML = tramCount;
}

UIManager.prototype.ChangeActiveCharts = function(dayInt) {this.gs.SetActiveChartDay(dayInt)}
UIManager.prototype.UpdateActiveStopLabel = function (){
    var activeStopID = this.gs.GetActiveStopID();
    var stop = this.gs.GetDataManager().GetStop(activeStopID);
    activeStopLabel.innerHTML = stop.Name+" ("+util.GetOrigID(activeStopID)+")"
}