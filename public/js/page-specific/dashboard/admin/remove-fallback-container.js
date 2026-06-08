const overlay = document.getElementsByClassName('overlay')[0];
const fallbackCancel = document.getElementById('fallback-cancel');

fallbackCancel.addEventListener('click', () => {
    overlay.style.display = 'none';
});