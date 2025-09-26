document.addEventListener("DOMContentLoaded", () => {

    const map_tabs = {
        "qr-btn": ".container",
        "session-btn": ".student-attendance",
        "leave-btn": ".request-leave",
        "notice-btn": ".notices",
        "edit-info-btn": ".edit-info"
    };

    if (window.innerWidth > 768) {
        const el = document.querySelector(".edit-your-info");
        if (el) el.style.display = "flex";
    }

    const sidenav = document.querySelector(".dashboard-sidenav");
    if (sidenav) {
        sidenav.addEventListener("click", (e) => {
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
    }

    const slidemenu = document.querySelector(".slide-menu");
    if (slidemenu) {
        slidemenu.addEventListener("click", (e) => {
            const clicked = e.target;
            slidemenu.style.right = "-80vw";

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
    }

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
