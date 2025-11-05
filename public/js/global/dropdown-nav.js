
document.getElementById("mobile-nav").addEventListener("change", function () {
    const selected = this.value;
    if (selected) window.location.href = selected;
});
