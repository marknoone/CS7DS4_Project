const shBtn = document.querySelector('#show-hide-btn');
const filterBtn = document.querySelector('#filter-btn');
const filterLayout = document.querySelector('#filter-layout');
const zoomPlusBtn = document.querySelector('#zoom-plus-btn');
const zoomMinusBtn = document.querySelector('#zoom-minus-btn');
const zoomLayout = document.querySelector('#zoom-layout');
const infoBtn = document.querySelector('#info-btn');
const infoLayout = document.querySelector('#info-layout');
const popup = document.getElementsByClassName('popup-layout')[0];

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

// Change to update charts existing already in ChartManager.
mondaySelect.addEventListener('click',    function(e) { dayCharts.style.right = "0vw";   });
tuesdaySelect.addEventListener('click',   function(e) { dayCharts.style.right = "100vw"; });
wednesdaySelect.addEventListener('click', function(e) { dayCharts.style.right = "200vw"; });
thursdaySelect.addEventListener('click',  function(e) { dayCharts.style.right = "300vw"; });
fridaySelect.addEventListener('click',    function(e) { dayCharts.style.right = "400vw"; });
saturdaySelect.addEventListener('click',  function(e) { dayCharts.style.right = "500vw"; });
sundaySelect.addEventListener('click',    function(e) { dayCharts.style.right = "600vw"; });

var uiState = {
    isInfoShowing: false,
    isFilterShowing: false,
    isPopupShowing: true
}

function toggleActiveBtn(el){
    if (el.classList.contains("active-btn")) {
        el.classList.remove("active-btn");
    } else {
        el.classList.add("active-btn");
    }
}

function toggleToggle(el){
    if (el.classList.contains("active-toggle")) {
        el.classList.remove("active-toggle");
    } else {
        el.classList.add("active-toggle");
    }
}

function updateUI() {
    // Change button icon
    if (uiState.isPopupShowing) {
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
    if (uiState.isPopupShowing) 
        popup.style.bottom = "0px";
    else
        popup.style.bottom = "-424px";

    if(uiState.isFilterShowing){
        filterLayout.style.opacity = 1
        setTimeout(function(){ filterLayout.style.visibility = "visible"; }, 150);
    }
    else{
        filterLayout.style.opacity = 0
        setTimeout(function(){ filterLayout.style.visibility = "hidden"; }, 150);
    }

    if(uiState.isInfoShowing){
        infoLayout.style.opacity = 1
        setTimeout(function(){ infoLayout.style.visibility = "visible"; }, 150);
    }
    else {
        infoLayout.style.opacity = 0
        setTimeout(function(){ infoLayout.style.visibility = "hidden"; }, 150);
    }
}

shBtn.addEventListener('click', function(e) {
    uiState.isPopupShowing = !uiState.isPopupShowing;

    updateUI();  // TODO: Remove and place with render call
});

filterBtn.addEventListener('click', function(e) {
    uiState.isFilterShowing = !uiState.isFilterShowing;
    toggleActiveBtn(filterBtn)
    updateUI(); // TODO: Remove and place with render call
});

infoBtn.addEventListener('click', function(e) {
    uiState.isInfoShowing = !uiState.isInfoShowing;
    toggleActiveBtn(infoBtn)
    updateUI(); // TODO: Remove and place with render call
});

// Start UI
updateUI();