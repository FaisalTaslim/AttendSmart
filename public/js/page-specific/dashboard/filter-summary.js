document.addEventListener("DOMContentLoaded", function () {
    filterByType("students"); // Default: Students Monthly Summary
    filterBySummary("monthly");
});

function filterByType(type) {
    const studentSummary = document.querySelector(".college-students");
    const employeeSummary = document.querySelector(".employees");

    if (type === "students") {
        studentSummary.style.display = "block";
        employeeSummary.style.display = "none";
    } else {
        studentSummary.style.display = "none";
        employeeSummary.style.display = "block";
    }

    const summaryType = document.getElementById("summaryType").value;
    filterBySummary(summaryType);
}

function filterBySummary(type) {
    const studentMonthly = document.getElementById("student-monthly-summary");
    const studentFinal = document.getElementById("final-student-summary");

    const empMonthly = document.getElementById("monthly-employee-summary");
    const empFinal = document.getElementById("final-employee-summary");

    const filterType = document.getElementById("filterType").value;

    [studentMonthly, studentFinal, empMonthly, empFinal].forEach(tbl => {
        tbl.style.display = "none";
    });

    if (filterType === "students") {
        if (type === "monthly") {
            studentMonthly.style.display = "table";
        } else {
            studentFinal.style.display = "table";
        }
    }

    else {
        if (type === "monthly") {
            empMonthly.style.display = "table";
        } else {
            empFinal.style.display = "table";
        }
    }
}