document.addEventListener("DOMContentLoaded", () => {

    const map_tabs = {
        "edit-info-btn": ".edit-info",
        "mark-att-btn": ".attendance-container",
        "notice-btn": ".notices",
        "leave-btn": ".request-leave-container",
    };

    if (window.innerWidth > 768) {
        const el = document.querySelector(".edit-your-info");
        if (el) el.style.display = "flex";
    }

    const hideAllTabs = () => {
        Object.values(map_tabs).forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.style.display = "none";
        });
    };

    const showTab = (key) => {
        const tab = document.querySelector(map_tabs[key]);
        if (tab) tab.style.display = "flex";
    };

    const sidenav = document.querySelector(".dashboard-sidenav");
    if (sidenav) {
        sidenav.addEventListener("click", (e) => {
            const clicked = e.target;
            for (const key in map_tabs) {
                if (clicked.classList.contains(key)) {
                    hideAllTabs();
                    showTab(key);
                }
            }
        });
    }

    const slidemenu = document.querySelector(".slide-menu");
    if (slidemenu) {
        slidemenu.addEventListener("click", (e) => {
            const clicked = e.target;

            if (!clicked.closest(".slide-menu-links-nav")) {
                slidemenu.style.right = "-80vw";
            }

            for (const key in map_tabs) {
                if (clicked.classList.contains(key)) {
                    hideAllTabs();
                    showTab(key);
                    slidemenu.style.right = "-80vw";
                }
            }
        });
    }

    const x_mark = document.querySelector(".overlay-head > .fa-xmark");
    if (x_mark) {
        x_mark.addEventListener("click", () => {
            hideAllTabs();
            const info = document.querySelector(".edit-your-info");
            if (info) info.style.display = "flex";
        });
    }
});
