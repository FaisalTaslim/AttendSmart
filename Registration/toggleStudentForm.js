const studentTypeSelect = document.getElementById("studentType");
const schoolFields = document.getElementById("school-student-fields");
const collegeFields = document.getElementById("college-student-fields");

studentTypeSelect.addEventListener("change", function () {
    const value = this.value;

    if (value === "school") {
        schoolFields.style.display = "block";
        collegeFields.style.display = "none";
    } else if (value === "college") {
        collegeFields.style.display = "block";
        schoolFields.style.display = "none";
    } else {
        schoolFields.style.display = "none";
        collegeFields.style.display = "none";
    }
});