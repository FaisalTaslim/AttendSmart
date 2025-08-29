function handleSlideMenu() {
    const screenWidth = window.innerWidth;

    const menuToggle = document.getElementById("menu-toggle");
    const closeToggle = document.getElementById("close-toggle");
    const slideMenu = document.querySelector(".slide-menu");
    const logo = document.querySelector(".logo");

    if (!menuToggle || !closeToggle || !slideMenu) return;

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
        slideMenu.style.right = "-80vw";
        logo.style.display = "block";
        document.body.classList.remove("no-scroll");
    }
}

document.addEventListener("DOMContentLoaded", handleSlideMenu);

window.addEventListener("resize", handleSlideMenu); function handleSlideMenu() {
    const screenWidth = window.innerWidth;

    const menuToggle = document.getElementById("menu-toggle");
    const closeToggle = document.getElementById("close-toggle");
    const slideMenu = document.querySelector(".slide-menu");
    const logo = document.querySelector(".logo");

    if (!menuToggle || !closeToggle || !slideMenu) return;

    let closePosition = "-80vw";
    if (screenWidth > 480 && screenWidth <= 1024) {
        closePosition = "-50vw";
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

document.addEventListener("DOMContentLoaded", handleSlideMenu);
window.addEventListener("resize", handleSlideMenu);