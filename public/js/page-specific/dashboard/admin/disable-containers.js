const overlay = document.getElementsByClassName('overlay')[0];
const sessionFormCancel = document.getElementById('sessionform-cancel');
const loginLogCancel = document.getElementById('login-log-go-back');
const registerLogCancel = document.getElementById('registerlog-cancel-btn');
const activeEmployeeLogCancel = document.getElementById('active-employee-cancel-btn');
const activeStudentLogCancel = document.getElementById('active-student-cancel-btn');
const employeeHistoryLogCancel = document.getElementById('employee-history-cancel-btn');
const studentHistoryLogCancel = document.getElementById('student-history-cancel-btn');

sessionFormCancel.addEventListener('click', () => {
    sessionForm.style.display = 'none';
    overlay.style.display = 'none';
});

loginLogCancel.addEventListener('click', () => {
    loginLog.style.display = 'none';
    overlay.style.display = 'none';
})

registerLogCancel.addEventListener('click', () => {
    registerLog.style.display = 'none';
    overlay.style.display = 'none';
})

activeEmployeeLogCancel.addEventListener('click', () => {
    activeEmployeeSession.style.display = 'none';
    overlay.style.display = 'none';
})

activeStudentLogCancel.addEventListener('click', () => {
    activeStudentSession.style.display = 'none';
    overlay.style.display = 'none';
});

employeeHistoryLogCancel.addEventListener('click', () => {
    employeeHistory.style.display = 'none';
    overlay.style.display = 'none';
})

studentHistoryLogCancel.addEventListener('click', () => {
    studentHistory.style.display = 'none';
    overlay.style.display = 'none';
})