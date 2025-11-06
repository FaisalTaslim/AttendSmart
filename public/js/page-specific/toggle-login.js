const login_go_btn = document.querySelector(".login-go-back");
const login_page = document.querySelector(".login-page-btn");
const main_3 = document.querySelector(".main-3");

login_page.addEventListener("click", () => {
    main_3.style.display = "flex";
});

login_go_btn.addEventListener("click", () => {
    main_3.style.display = "none";
});