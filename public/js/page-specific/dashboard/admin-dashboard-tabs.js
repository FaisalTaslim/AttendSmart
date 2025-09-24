document.addEventListener("DOMContentLoaded", () => {

    const map_tabs = {
        ".qr-btn": "#generate-employee-qr",
        ".session-btn": ".student-attendance",
        ".records-btn": ".view-records",
        ".edit-att-btn": ".edit-attendance",
        ".leave-btn": ".manage-leave-requests",
        ".notice-btn": ".send-notice-container",
        ".users-btn": ".manage-users",
        ".logs-btn": ".browse-logs",
        ".edit-info-btn": ".edit-your-info"
    };

    if (window.innerWidth > 768) {
        const el = document.querySelector(".edit-your-info");
        if (el) el.style.display = "flex";
    }

    for (const key in map_tabs) {
        const btn = document.querySelector(key);
        const tab = document.querySelector(map_tabs[key]);

        if (btn && tab) {
            btn.addEventListener("click", () => {
                Object.values(map_tabs).forEach(selector => {
                    const el = document.querySelector(selector);
                    if (el) el.style.display = "none";
                });
                tab.style.display = "flex";

                if (window.innerWidth <= 768) {
                    const buttons = document.querySelector(".dashboard-buttons");
                    if (buttons) buttons.style.display = "none";

                    if (key === ".users-btn") {
                        tab.style.display = "none";
                        const msg = document.querySelector(".mobile-nav-btn > .message");
                        if (msg) msg.style.display = "block";
                    }
                }
            });
        }
    }

    const backBtn = document.querySelector(".mobile-nav-btn > .btn > .fa-arrow-rotate-left");
    const x_mark = document.querySelector(".overlay-head > .fa-xmark");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            Object.values(map_tabs).forEach(selector => {
                const el = document.querySelector(selector);
                if (el) el.style.display = "none";
                document.querySelector(".mobile-nav-btn > .message").style.display = "none";
            });

            const buttons = document.querySelector(".dashboard-buttons");
            if (buttons) buttons.style.display = "flex";
        });
    }

    if (x_mark) {
        x_mark.addEventListener("click", () => {
            Object.values(map_tabs).forEach(selector => {
                const el = document.querySelector(selector);
                if (el) el.style.display = "none";
            });

            const buttons = document.querySelector(".dashboard-buttons");
            if (buttons) buttons.style.display = "flex";
        });
    }

});
