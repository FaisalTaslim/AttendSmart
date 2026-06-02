const contentsContainer = document.getElementsByClassName('dashboard-contents')[0];
const overlay = document.getElementsByClassName('overlay')[0];
const fallbackCancel = document.getElementById('fallback-cancel');

fallbackCancel.addEventListener('click', () => {
    overlay.style.display = 'none';
    contentsContainer.style.display = 'none';
});