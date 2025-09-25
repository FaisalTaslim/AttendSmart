document.addEventListener("DOMContentLoaded", () => {

    const map_tabs = {
        ".att-overview-btn": ".att-overview",
        ".edit-info-btn": ".edit-info",
        ".notice-btn": ".notices",
        ".leave-btn": ".request-leave",
        ".qr-btn": ".container",
        ".session-btn": ".student-attendance",
        ".edit-att-btn": ".att-edit",
        ".records-btn": ".records",
    };

    // Show edit-info on desktop automatically
    if (window.innerWidth > 768) {
        const el = document.querySelector(".edit-info");
        if (el) el.style.display = "flex";
    }

    // Attach click listeners to each button
    for (const key in map_tabs) {
        const btn = document.querySelector(key);
        const tab = document.querySelector(map_tabs[key]);

        if (btn && tab) {
            btn.addEventListener("click", () => {
                // Hide all tabs
                Object.values(map_tabs).forEach(selector => {
                    const el = document.querySelector(selector);
                    if (el) el.style.display = "none";
                });

                // Show the selected one
                tab.style.display = "flex";

                // Mobile-only behavior
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

    // Back button (mobile)
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

    // Close button on overlay
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
