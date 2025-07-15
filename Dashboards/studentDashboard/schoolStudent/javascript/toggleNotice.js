document.addEventListener("DOMContentLoaded", () => {
    const showNoticesBtn = document.getElementById("showNoticesBtn");
    const showLeaveBtn = document.getElementById("showLeaveBtn");

    const notices = document.querySelector(".notices");
    const requestLeave = document.querySelector(".request-leave");

    notices.style.display = "none";
    requestLeave.style.display = "block";

    showNoticesBtn.addEventListener("click", () => {
        notices.style.display = "block";
       
    }); requestLeave.style.display = "none";

    showLeaveBtn.addEventListener("click", () => {
        notices.style.display = "none";
        requestLeave.style.display = "block";
    });
});
