const noticeBody = document.getElementById("sendNoticeForm");
const noticeHeading = document.querySelector(".notice-heading");
const viewNotices = document.querySelector(".view-notice-heading");
const getViewNoticesClass = document.querySelector(".view-notices");
const closebtn = document.querySelector(".fa-right-left");

if (viewNotices) {
    viewNotices.addEventListener("click", () => {
        getViewNoticesClass.style.display = "flex";
        noticeBody.style.display = "none";
        noticeHeading.style.display = "none";
    });

    closebtn.addEventListener("click", () => {
        getViewNoticesClass.style.display = "none";
        noticeBody.style.display = "flex";
        noticeHeading.style.display = "flex";
    });
}