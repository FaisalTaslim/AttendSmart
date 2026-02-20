const toggleBtn = document.querySelector('.nav-toggle');
const left = document.querySelector('.left-side');
const sidenav = document.querySelector('.sidenav-wrapper');
const dashboard = document.querySelector('.dashboard-sidenav');

toggleBtn.addEventListener('click', () => {
    left.style.display = "flex";
    sidenav.classList.toggle('active');
});

sidenav.addEventListener('click', (e) => {
    if (!dashboard.contains(e.target)) {
        sidenav.classList.remove('active');
        left.style.display = "none";
    }
});