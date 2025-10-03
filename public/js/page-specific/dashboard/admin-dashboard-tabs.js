document.addEventListener("DOMContentLoaded", () => {

    const map_tabs = {
        "qr-btn": "#generate-employee-qr",
        "session-btn": ".student-attendance",
        "records-btn": ".view-records",
        "edit-att-btn": ".edit-attendance",
        "leave-btn": ".manage-leave-requests",
        "notice-btn": ".send-notice-container",
        "users-btn": ".manage-users",
        "logs-btn": ".browse-logs",
        "edit-info-btn": ".edit-your-info"
    };

    if (window.innerWidth > 768) {
        const el = document.querySelector(".edit-your-info");
        if (el) el.style.display = "flex";
    }

    const menus = document.querySelectorAll(".dashboard-sidenav, .slide-menu");

    menus.forEach(menu => {
        menu.addEventListener("click", (e) => {
            const clicked = e.target;

            for (const key in map_tabs) {
                if (clicked.classList.contains(key)) {
                    Object.values(map_tabs).forEach(selector => {
                        const el = document.querySelector(selector);
                        if (el) el.style.display = "none";
                    });

                    const tab = document.querySelector(map_tabs[key]);
                    if (tab) tab.style.display = "flex";
                }
            }
        });
    });

    const x_mark = document.querySelector(".overlay-head > .fa-xmark");
    if (x_mark) {
        x_mark.addEventListener("click", () => {
            Object.values(map_tabs).forEach(selector => {
                const el = document.querySelector(selector);
                if (el) el.style.display = "none";
            });

            const info = document.querySelector(".edit-your-info");
            if (info) info.style.display = "flex";
        });
    }
});
