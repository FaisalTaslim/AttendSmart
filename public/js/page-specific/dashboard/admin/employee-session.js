const overlay2 = document.getElementsByClassName("overlay")[0];

const getBtn = document.getElementById("start-session-btn");
const loginLogBtn = document.getElementById("login-logs-btn");
const registerLogBtn = document.getElementById("register-logs-btn");
const activeEmployeeSessionBtn = document.getElementById('active-employee-session-btn');
const activeStudentSessionBtn = document.getElementById('active-student-session-btn');
const employeeHistoryBtn = document.getElementById('employee-attendance-history-btn');
const studentHistoryBtn = document.getElementById('student-attendance-history-btn');

const sessionForm = document.getElementById("session-form");
const loginLog = document.getElementById('login-logs');
const registerLog = document.getElementById('register-logs');
const activeEmployeeSession = document.getElementById('active-employee-session-log');
const activeStudentSession = document.getElementById('active-student-session-log');
const employeeHistory = document.getElementById('employee-attendance-history-log');
const studentHistory = document.getElementById('student-attendance-history-log');

const hideDashboardPanels = () => {
  sessionForm.style.display = 'none';
  loginLog.style.display = 'none';
  registerLog.style.display = 'none';
  activeEmployeeSession.style.display = 'none';
  activeStudentSession.style.display = 'none';
  employeeHistory.style.display = 'none';
  studentHistory.style.display = 'none';
};

getBtn.addEventListener("click", async () => {
  try {
    hideDashboardPanels();
    overlay2.style.display = "flex";
    sessionForm.style.display = "flex";
  } catch {
    alert("Something went wrong.");
  }
});

loginLogBtn.addEventListener('click', () => {
  try {
    hideDashboardPanels();
    overlay2.style.display = "flex";
    loginLog.style.display = "flex";
  } catch {
    alert("Something went wrong");
  }
});

registerLogBtn.addEventListener('click', () => {
  try {
    hideDashboardPanels();
    overlay2.style.display = "flex";
    registerLog.style.display = "flex";
  } catch {
    alert("Something went wrong");
  }
});

activeEmployeeSessionBtn.addEventListener('click', () => {
  try {
    hideDashboardPanels();
    overlay2.style.display = 'flex';
    activeEmployeeSession.style.display = 'flex';
  } catch {
    alert("something went wrong");
  }
});

activeStudentSessionBtn.addEventListener('click', () => {
  try {
    hideDashboardPanels();
    overlay2.style.display = 'flex';
    activeStudentSession.style.display = 'flex';
  } catch {
    alert("something went wrong");
  }
});

employeeHistoryBtn.addEventListener('click', () => {
  try {
    hideDashboardPanels();
    overlay2.style.display = 'flex';
    employeeHistory.style.display = 'flex';
  } catch {
    alert("something went wrong");
  }
});

studentHistoryBtn.addEventListener('click', () => {
  try {
    hideDashboardPanels();
    overlay2.style.display = 'flex';
    studentHistory.style.display = 'flex';
  } catch {
    alert("something went wrong");
  }
});
