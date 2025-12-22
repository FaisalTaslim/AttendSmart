/* -----------------------------
   UI TOGGLE (login / main-3)
-------------------------------- */

function setupLoginToggle() {
    const loginGoBtn = document.querySelector(".login-go-back");
    const loginPageBtn = document.querySelector(".login-page-btn");
    const main3 = document.querySelector(".main-3");

    if (!loginGoBtn || !loginPageBtn || !main3) return;

    loginPageBtn.addEventListener("click", () => {
        main3.style.display = "flex";
    });

    loginGoBtn.addEventListener("click", () => {
        main3.style.display = "none";
    });
}

/* -----------------------------
   PASSWORD VALIDATION
-------------------------------- */

function validateAllPasswords(form) {
    const passwords = form.querySelectorAll(".password");
    const confirms = form.querySelectorAll(".confirm-password");

    if (passwords.length !== confirms.length) return;

    form.addEventListener("submit", (e) => {
        for (let i = 0; i < passwords.length; i++) {
            if (passwords[i].value !== confirms[i].value) {
                e.preventDefault();
                alert("Passwords do not match");
                confirms[i].focus();
                return;
            }
        }
    });
}

/* -----------------------------
   DISABLE SUBMIT BUTTON
-------------------------------- */

function attachDisable(form) {
    const btn = form.querySelector(".to-disable");
    if (!btn) return;

    form.addEventListener(
        "submit",
        () => {
            btn.disabled = true;
            btn.innerText = "Registering...";

            setTimeout(() => {
                btn.disabled = false;
                btn.innerText = "Register";
            }, 10000);
        },
        { once: true }
    );
}


function toggleRegister() {
    const typeSelect = document.getElementById("registration-type");
    const allForms = document.querySelectorAll(".r-forms");

    if (!typeSelect) return;

    typeSelect.addEventListener("change", () => {
        allForms.forEach(form => {
            form.style.display = "none";
        });

        const selectedId = typeSelect.value;
        if (!selectedId) return;

        const activeForm = document.getElementById(selectedId);
        if (activeForm) {
            activeForm.style.display = "flex";
        }
    });
}

function toggleSupport() {
    const typeSelect = document.getElementById("support-type");
    const allForms = document.querySelectorAll(".s-forms");

    if (!typeSelect) return;

    typeSelect.addEventListener("change", () => {
        allForms.forEach(form => {
            form.style.display = "none";
        });

        const selectedId = typeSelect.value;
        if (!selectedId) return;

        const activeForm = document.getElementById(selectedId);
        if (activeForm) {
            activeForm.style.display = "flex";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupLoginToggle();
    toggleRegister();
    toggleSupport();

    document.querySelectorAll("form").forEach(form => {
        attachDisable(form);
        validateAllPasswords(form);
    });
});
