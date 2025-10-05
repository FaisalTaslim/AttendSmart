const leaveStatusBtn = document.querySelector(".status-btn");
const displayYourLeave = document.querySelector(".display-your-leave");
const requestLeaveForm = document.querySelector(".request-leave");
const goBack = document.querySelector(".leave-go-back");

leaveStatusBtn.addEventListener("click", () => {
    requestLeaveForm.style.display = "none";
    displayYourLeave.style.display = "flex";
});

goBack.addEventListener("click", () => {
    requestLeaveForm.style.display = "flex";
    displayYourLeave.style.display = "none";
})