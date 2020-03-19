const shBtn = document.querySelector('#show-hide-btn')
const popup = document.getElementsByClassName('popup-layout')[0]

var isPopupShowing = false; 
function updatePopup() {
    // Change button icon
    if (isPopupShowing)
        shBtn.childNodes[0].className = "fas fa-angle-down";
    else
        shBtn.childNodes[0].className = "fas fa-angle-up"

    // Set popup position
    if (isPopupShowing) 
        popup.style.bottom = "0px"
    else
        popup.style.bottom = "-304px";

}

shBtn.addEventListener('click', function(e) {
    isPopupShowing = !isPopupShowing;
    updatePopup();
});

// Start UI
updatePopup();