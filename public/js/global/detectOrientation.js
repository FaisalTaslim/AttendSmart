function checkDevice() {
    const overlay = document.getElementById("orientation-overlay");

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isBigTablet = (width >= 768 && width <= 1024) && (height >= 1024 && height <= 1368);

    const isLandscapePhone = height < 480;

    if (isBigTablet || isLandscapePhone) {
        overlay.style.display = "flex !important";
    } else {
        overlay.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", checkDevice);
window.addEventListener("resize", checkDevice);
window.addEventListener("orientationchange", checkDevice);