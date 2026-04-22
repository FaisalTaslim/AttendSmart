(() => {
    const mobileNav = document.getElementById('mobile-nav');
    if (!mobileNav) return;

    mobileNav.addEventListener('change', (event) => {
        const target = event.target.value;
        if (!target) return;

        if (target === '#login') {
            const loginSection = document.querySelector('.main-3');
            if (loginSection) {
                loginSection.style.display = 'flex';
            }
        } else {
            window.location.href = target;
        }
    });
})();