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
const popup = document.getElementsByClassName('popup-layout')[0];

// Speed controls
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
const dayCharts         = document.querySelector('#chart-container');
const mondaySelect      = document.querySelector('#monday');
const tuesdaySelect     = document.querySelector('#tuesday');
const wednesdaySelect   = document.querySelector('#wednesday');
const thursdaySelect    = document.querySelector('#thursday');
const fridaySelect      = document.querySelector('#friday');
const saturdaySelect    = document.querySelector('#saturday');
const sundaySelect      = document.querySelector('#sunday');

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
    mondaySelect.addEventListener('click',    function(e) { dayCharts.style.right = "0vw";   });
    tuesdaySelect.addEventListener('click',   function(e) { dayCharts.style.right = "100vw"; });
    wednesdaySelect.addEventListener('click', function(e) { dayCharts.style.right = "200vw"; });
    thursdaySelect.addEventListener('click',  function(e) { dayCharts.style.right = "300vw"; });
    fridaySelect.addEventListener('click',    function(e) { dayCharts.style.right = "400vw"; });
    saturdaySelect.addEventListener('click',  function(e) { dayCharts.style.right = "500vw"; });
    sundaySelect.addEventListener('click',    function(e) { dayCharts.style.right = "600vw"; });

    shBtn.addEventListener('click', function(e) {
        thisUI.state.isPopupShowing = !thisUI.state.isPopupShowing;
        thisUI.updateUI();  // TODO: Remove and place with render call
    });
    
    filterBtn.addEventListener('click', function(e) {
        thisUI.state.isFilterShowing = !thisUI.state.isFilterShowing;
        thisUI.toggleActiveBtn(filterBtn)
        thisUI.updateUI(); // TODO: Remove and place with render call
    });
    
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

    // Start UI
    this.updateUI();
    this.UpdateClock();
    this.UpdateSimClock();
    this.UpdateSimSpeed();
    this.UpdatePlayPauseBtn();
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
    
    if(this.state.isFilterShowing){
        filterLayout.style.opacity = 1
        setTimeout(function(){ filterLayout.style.visibility = "visible"; }, 150);
    }
    else {
        filterLayout.style.opacity = 0
        setTimeout(function(){ filterLayout.style.visibility = "hidden"; }, 150);
    }
    
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