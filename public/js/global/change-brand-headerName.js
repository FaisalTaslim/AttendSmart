function updateLogoText() {
    const name = document.querySelector(".logo > h1");
    if (window.innerWidth <= 550) {
        name.textContent = "AttendSmart";
    } else {
        name.textContent = "AttendSmart - Smart Attendance Solution";
    }
}

window.addEventListener("resize", updateLogoText);
updateLogoText();