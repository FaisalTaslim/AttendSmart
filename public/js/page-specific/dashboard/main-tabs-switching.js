const map_tabs = {
    "qr-btn": "generate-employee-qr",
    "session-btn": "student-attendance",
    "records-btn": "view-records",
    "edit-att-btn": "edit-attendance",
    "leave-btn": "manage-leave-requests",
    "notice-btn": "send-notice-container",
    "users-btn": "manage-users",
    "logs-btn": "browse-logs",
    "edit-info-btn": "edit-your-info",
    "att-records-btn": "attendance-report",

    "scedit-info-btn": "edit-info",
    "scnotice-btn": "notices",
    "scleave-btn": "request-leave-container",
    "mark-att-btn": "attendance-container"
};

for (const key in map_tabs) {
    const getKey = document.querySelector('.dashboard-sidenav .' + key);
    const getValue = document.querySelector('.' + map_tabs[key]);

    if (!getKey || !getValue) continue;

    getKey.addEventListener('click', () => {
        Object.values(map_tabs).forEach(className => {
            const section = document.querySelector('.' + className);
            if (section) section.style.display = 'none';
        });

        getValue.style.display = 'flex';
    });
}