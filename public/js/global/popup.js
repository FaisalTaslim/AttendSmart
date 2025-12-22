document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("popup");
    if (!popup) return;

    setTimeout(() => {
        popup.classList.remove("show");
    }, 3000);
});