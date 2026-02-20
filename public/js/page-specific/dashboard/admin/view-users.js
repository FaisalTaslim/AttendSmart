(() => {
    const filterSelect = document.getElementById('users-type-filter');
    const studentTable = document.getElementById('users-table-students');
    const employeeTable = document.getElementById('users-table-employees');

    if (!filterSelect || !studentTable || !employeeTable) {
        return;
    }

    const showSelectedTable = () => {
        const selectedType = filterSelect.value;
        const showStudents = selectedType === 'students';

        studentTable.hidden = !showStudents;
        employeeTable.hidden = showStudents;
    };

    filterSelect.addEventListener('change', showSelectedTable);
    showSelectedTable();
})();
