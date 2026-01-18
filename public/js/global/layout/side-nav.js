const toggleBtn = document.querySelector('.nav-toggle');
const sidenav = document.querySelector('.sidenav-wrapper');

toggleBtn.addEventListener('click', () => {
    sidenav.classList.toggle('active');
});

sidenav.addEventListener('click', (e) => {
    if (e.target === sidenav) {
        sidenav.classList.remove('active');
    }
});