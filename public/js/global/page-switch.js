document.getElementById("mobile-nav").addEventListener("change", function () {
    const selected = this.value;

    if (selected == '#login')
        main_3.style.display = "flex";
    
    if (selected) window.location.href = selected;
});