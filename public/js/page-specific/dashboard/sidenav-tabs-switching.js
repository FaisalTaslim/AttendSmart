const map_tabs_sidenav = {
    "qr-btn": "generate-employee-qr",
    "session-btn": "student-attendance",
    "records-btn": "view-records",
    "edit-att-btn": "edit-attendance",
    "leave-btn": "manage-leave-requests",
    "notice-btn": "send-notice-container",
    "users-btn": "manage-users",
    "logs-btn": "browse-logs",
    "edit-info-btn": "edit-your-info",

    "scedit-info-btn": "edit-info",
    "scnotice-btn": "notices",
    "scleave-btn": "request-leave-container",
    "mark-att-btn": "attendance-container"
};

for (const key in map_tabs_sidenav) {
    const getKey = document.querySelector('.slide-menu .' + key);
    const getValue = document.querySelector('.' + map_tabs_sidenav[key]);
    const slideMenu = document.querySelector(".slide-menu");
    const logo = document.querySelector(".logo");

    if (!getKey || !getValue) continue;

    getKey.addEventListener('click', () => {
        Object.values(map_tabs_sidenav).forEach(className => {
            const section = document.querySelector('.' + className);
            if (section) {
                section.style.display = 'none';
                slideMenu.style.right = "-80vw";
                logo.style.display = "block";
            }
        });

        getValue.style.display = 'flex';
    });
}