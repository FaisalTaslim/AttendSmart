const getSessionBtn = document.getElementById('start-session');
const closeSessionBtn = document.getElementById('close-session');
const overlay = document.getElementById('overlay1');
const dashboardContents = document.getElementsByClassName('dashboard-contents')[0];

if (getSessionBtn && closeSessionBtn && overlay && dashboardContents) {
    closeSessionBtn.addEventListener("click", () => {
        overlay.style.display = 'none';
        dashboardContents.style.display = 'none';
        document.body.style.overflow = '';
    });

    getSessionBtn.addEventListener('click', () => {
        overlay.style.display = 'flex';
        dashboardContents.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}
