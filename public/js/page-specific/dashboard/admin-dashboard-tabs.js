document.addEventListener("DOMContentLoaded", () => {
    const buttonMap = {
        "Generate Employee QR": "generate-employee-qr",
        "Student Attendance": "student-attendance",
        "View Records": "view-records",
        "Edit Attendance": "edit-attendance",
        "Manage Leave Requests": "manage-leave-requests",
        "Send Notice": "send-notice",
        "Manage Users": "manage-users",
        "Browse Logs": "browse-logs",
        "Edit Your Info": "edit-your-info"
    };

    const buttons = document.querySelectorAll(".dashboard-buttons .btn");
    const contents = document.querySelectorAll(".dashboard-contents > div");
    const dashboardButtons = document.querySelector(".dashboard-buttons");
    const dashboardContents = document.querySelector(".dashboard-contents");
    const otherContents = document.querySelector(".other-contents");

    const manageUsers = document.getElementById("manage-users");
    const closeManageUsers = manageUsers.querySelector(".fa-xmark");

    const studentAttendance = document.getElementById("student-attendance");
    const closeStudentAttendance = studentAttendance.querySelector(".overlay-head > .fa-xmark");

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            contents.forEach((c) => (c.style.display = "none"));

            const targetId = buttonMap[btn.textContent.trim()];
            const targetDiv = document.getElementById(targetId);

            if (targetDiv) targetDiv.style.display = "flex";

            if (targetId === "manage-users") {
                dashboardButtons.style.display = "none";
                otherContents.classList.add("is-wide");
                dashboardContents.classList.add("is-wide");
            } else {
                dashboardButtons.style.display = "flex";
                otherContents.classList.remove("is-wide");
                dashboardContents.classList.remove("is-wide");
            }
        });
    });

    closeManageUsers.addEventListener("click", () => {
        manageUsers.style.display = "none";

        dashboardButtons.style.display = "flex";
        otherContents.classList.remove("is-wide");
        dashboardContents.classList.remove("is-wide");

        contents.forEach((c) => (c.style.display = "none"));
        document.getElementById("send-notice").style.display = "flex";
    });

    closeStudentAttendance.addEventListener("click", () => {
        studentAttendance.style.display = "none";

        contents.forEach((c) => (c.style.display = "none"));
        document.getElementById("send-notice").style.display = "flex";
    });

    contents.forEach((c) => (c.style.display = "none"));
    document.getElementById("send-notice").style.display = "flex";
    otherContents.classList.remove("is-wide");
    dashboardContents.classList.remove("is-wide");
});
