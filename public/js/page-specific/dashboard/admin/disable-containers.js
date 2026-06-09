const cancelBtns = [
  document.getElementById("sessionform-cancel"),
  document.getElementById("login-logs-cancel-btn"),
  document.getElementById("register-logs-cancel-btn"),
  document.getElementById("active-employee-cancel-btn"),
  document.getElementById("active-student-cancel-btn"),
  document.getElementById("employee-history-cancel-btn"),
  document.getElementById("student-history-cancel-btn"),
  document.getElementById("student-summary-cancel-btn"),
  document.getElementById("employee-summary-cancel-btn"),
  document.getElementById("account-info-cancel-btn"),
];

const hideOverlay = () => {
  overlay.style.display = "none";
  document.querySelectorAll(
    ".session-form, .login-logs, .register-logs, .active-employee-session-log, .active-student-session-log, .employee-attendance-history-log, .student-attendance-history-log, .student-summary-log, .employee-summary-log, .account-info-card"
  ).forEach((el) => (el.style.display = "none"));
};

cancelBtns.forEach((btn) => {
  if (btn) btn.addEventListener("click", hideOverlay);
});

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) hideOverlay();
});