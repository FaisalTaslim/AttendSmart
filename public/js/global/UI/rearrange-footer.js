function moveSocialsForTablet() {
  const width = window.innerWidth;
  const socials = document.querySelector('.socials');
  const foot1 = document.querySelector('.foot1');
  const foot2 = document.querySelector('.foot2');

  if (!socials || !foot1 || !foot2) return;

  if (width >= 481 && width <= 1024) {
    foot1.appendChild(socials);
    return;
  }

  foot2.insertBefore(socials, foot2.firstChild);
}

window.addEventListener('DOMContentLoaded', moveSocialsForTablet);
window.addEventListener('resize', moveSocialsForTablet);
