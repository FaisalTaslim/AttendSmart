const overlay = document.getElementsByClassName("overlay")[0];

const getBtn = document.getElementById("start-session-btn");
const loginLogBtn = document.getElementById("login-logs-btn");
const registerLogBtn = document.getElementById("register-logs-btn");
const activeEmployeeSessionBtn = document.getElementById("active-employee-session-btn");
const activeStudentSessionBtn = document.getElementById("active-student-session-btn");
const employeeHistoryBtn = document.getElementById("employee-attendance-history-btn");
const studentHistoryBtn = document.getElementById("student-attendance-history-btn");
const studentSummaryBtn = document.getElementById("student-summary-btn");
const employeeSummaryBtn = document.getElementById("employee-summary-btn");

const sessionForm = document.getElementById("session-form");
const loginLog = document.getElementById("login-logs");
const registerLog = document.getElementById("register-logs");
const activeEmployeeSession = document.getElementById("active-employee-session-log");
const activeStudentSession = document.getElementById("active-student-session-log");
const employeeHistory = document.getElementById("employee-attendance-history-log");
const studentHistory = document.getElementById("student-attendance-history-log");
const studentSummary = document.getElementById("student-summary-log");
const employeeSummary = document.getElementById("employee-summary-log");

const hideDashboardPanels = () => {
  sessionForm.style.display = "none";
  loginLog.style.display = "none";
  registerLog.style.display = "none";
  activeEmployeeSession.style.display = "none";
  activeStudentSession.style.display = "none";
  employeeHistory.style.display = "none";
  studentHistory.style.display = "none";
  studentSummary.style.display = "none";
  employeeSummary.style.display = "none";
};

const showPanel = (panel) => {
  hideDashboardPanels();
  overlay.style.display = "flex";
  panel.style.display = "flex";
};

getBtn.addEventListener("click", () => showPanel(sessionForm));
loginLogBtn.addEventListener("click", () => showPanel(loginLog));
registerLogBtn.addEventListener("click", () => showPanel(registerLog));
activeEmployeeSessionBtn.addEventListener("click", () => showPanel(activeEmployeeSession));
activeStudentSessionBtn.addEventListener("click", () => showPanel(activeStudentSession));
employeeHistoryBtn.addEventListener("click", () => showPanel(employeeHistory));
studentHistoryBtn.addEventListener("click", () => showPanel(studentHistory));
studentSummaryBtn.addEventListener("click", () => showPanel(studentSummary));
employeeSummaryBtn.addEventListener("click", () => showPanel(employeeSummary));