(() => {
    const userTypeSelect = document.getElementById("manage-users-type");
    const searchInput = document.getElementById("manage-users-search");
    const studentWrap = document.getElementById("manage-students-wrap");
    const employeeWrap = document.getElementById("manage-employees-wrap");

    if (!userTypeSelect || !searchInput || !studentWrap || !employeeWrap) return;

    const toggleUserTable = () => {
        const isStudents = userTypeSelect.value === "students";
        studentWrap.hidden = !isStudents;
        employeeWrap.hidden = isStudents;
        filterRows();
    };

    const filterStudentRows = (searchValue) => {
        const rows = document.querySelectorAll(".manage-student-row");

        rows.forEach((row) => {
            const name = row.querySelector(".manage-student-name")?.textContent.toLowerCase() || "";
            const email = row.querySelector(".manage-student-email")?.textContent.toLowerCase() || "";
            const roll = row.querySelector(".manage-student-roll")?.textContent.toLowerCase() || "";
            const code = row.querySelector(".manage-student-code")?.textContent.toLowerCase() || "";

            if (
                name.includes(searchValue) ||
                email.includes(searchValue) ||
                roll.includes(searchValue) ||
                code.includes(searchValue)
            ) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    };

    const filterEmployeeRows = (searchValue) => {
        const rows = document.querySelectorAll(".manage-employee-row");

        rows.forEach((row) => {
            const name = row.querySelector(".manage-employee-name")?.textContent.toLowerCase() || "";
            const email = row.querySelector(".manage-employee-email")?.textContent.toLowerCase() || "";
            const employeeId = row.querySelector(".manage-employee-id")?.textContent.toLowerCase() || "";
            const code = row.querySelector(".manage-employee-code")?.textContent.toLowerCase() || "";

            if (
                name.includes(searchValue) ||
                email.includes(searchValue) ||
                employeeId.includes(searchValue) ||
                code.includes(searchValue)
            ) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    };

    const filterRows = () => {
        const searchValue = searchInput.value.toLowerCase();
        if (userTypeSelect.value === "students") {
            filterStudentRows(searchValue);
        } else {
            filterEmployeeRows(searchValue);
        }
    };

    userTypeSelect.addEventListener("change", toggleUserTable);
    searchInput.addEventListener("keyup", filterRows);

    toggleUserTable();
})();
