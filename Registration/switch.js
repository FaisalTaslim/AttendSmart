const adminForm = document.getElementById("admin-form");
const studentForm = document.getElementById("student-form");
const employeeForm = document.getElementById("employee-form");

const adminBtn = document.getElementById("admin-btn");
const studentBtn = document.getElementById("student-btn");
const employeeBtn = document.getElementById("employee-btn");

function hideAllForms() {
    adminForm.style.display = "none";
    studentForm.style.display = "none";
    employeeForm.style.display = "none";
}

function showForm(formEl) {
    hideAllForms();
    formEl.style.display = formEl === adminForm ? "flex" : "block";
}

adminBtn.addEventListener("click", () => showForm(adminForm));
studentBtn.addEventListener("click", () => showForm(studentForm));
employeeBtn.addEventListener("click", () => showForm(employeeForm));
