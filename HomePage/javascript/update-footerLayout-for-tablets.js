function moveSocialsForTablet() {
  const width = window.innerWidth;
  const socials = document.querySelector('.socials');
  const foot1 = document.querySelector('.foot1');

  if (width >= 481 && width <= 1024 && socials && foot1) {
    foot1.appendChild(socials);
  }
}

window.addEventListener('DOMContentLoaded', moveSocialsForTablet);
window.addEventListener('resize', moveSocialsForTablet);
