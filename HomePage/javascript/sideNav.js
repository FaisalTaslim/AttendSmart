function handleSlideMenu() {
  const screenWidth = window.innerWidth;

  const menuToggle = document.getElementById("menu-toggle");
  const closeToggle = document.getElementById("close-toggle");
  const slideMenu = document.querySelector(".slide-menu");
  const logo = document.querySelector(".logo");

  // First, remove any previous event listeners (optional safety)
  if (!menuToggle || !closeToggle || !slideMenu) return;

  // Only enable if screen is <= 1024px (mobile + tablet)
  if (screenWidth <= 1024) {
    menuToggle.onclick = () => {
      slideMenu.style.right = "0";
      logo.style.display = "none";
      document.body.classList.add("no-scroll");
    };

    closeToggle.onclick = () => {
      slideMenu.style.right = "-80vw";
      logo.style.display = "block";
      document.body.classList.remove("no-scroll");
    };

    const navLinks = slideMenu.querySelectorAll("a");
    navLinks.forEach(link => {
      link.onclick = () => {
        slideMenu.style.right = "-80vw";
        logo.style.display = "block";
        document.body.classList.remove("no-scroll");
      };
    });
  } else {
    // Clean up if switching to desktop view
    slideMenu.style.right = "-80vw";
    logo.style.display = "block";
    document.body.classList.remove("no-scroll");
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", handleSlideMenu);

// Run on window resize
window.addEventListener("resize", handleSlideMenu);function handleSlideMenu() {
  const screenWidth = window.innerWidth;

  const menuToggle = document.getElementById("menu-toggle");
  const closeToggle = document.getElementById("close-toggle");
  const slideMenu = document.querySelector(".slide-menu");
  const logo = document.querySelector(".logo");

  if (!menuToggle || !closeToggle || !slideMenu) return;

  // Set correct "closed" position based on screen size
  let closePosition = "-80vw"; // default for smartphones
  if (screenWidth > 480 && screenWidth <= 1024) {
    closePosition = "-50vw"; // tablets
  }

  menuToggle.onclick = () => {
    slideMenu.style.right = "0";
    logo.style.display = "none";
    document.body.classList.add("no-scroll");
  };

  closeToggle.onclick = () => {
    slideMenu.style.right = closePosition;
    logo.style.display = "block";
    document.body.classList.remove("no-scroll");
  };

  const navLinks = slideMenu.querySelectorAll("a");
  navLinks.forEach(link => {
    link.onclick = () => {
      slideMenu.style.right = closePosition;
      logo.style.display = "block";
      document.body.classList.remove("no-scroll");
    };
  });
}

// Run on load and resize
document.addEventListener("DOMContentLoaded", handleSlideMenu);
window.addEventListener("resize", handleSlideMenu);
