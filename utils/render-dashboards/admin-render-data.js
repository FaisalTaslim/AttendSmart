const LoginLogs = require("../../models/logs/login");
const RegisterLogs = require("../../models/logs/register");
const ActiveEmployeeSession = require("../../models/attendance/active-employee-session");
const ActiveStudentSession = require("../../models/attendance/active-student-session");
const EmployeeHistory = require("../../models/logs/employee-attendance-history");
const StudentHistory = require("../../models/logs/student-attendance-history");
const StudentSummary = require("../../models/statistics/student-summary");
const EmployeeSummary = require("../../models/statistics/employee-summary");

function normalizeTexts(text) {
  return text
    .split(" ")
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join(" ");
}

module.exports = async function getAdminRenderData(user, overrides = {}) {
  const code = user.code;

  const [
    loginLog,
    registerLog,
    activeEmployeeSessions,
    activeStudentSessions,
    employeeHistory,
    studentHistory,
    studentSummary,
    employeeSummary,
  ] = await Promise.all([
    LoginLogs.find({ org: code }).sort({ createdAt: -1 }),
    RegisterLogs.find({ org: code }).sort({ createdAt: -1 }),
    ActiveEmployeeSession.find({ org: code }),
    ActiveStudentSession.find({ org: code }),
    EmployeeHistory.find({ org: code }).sort({ createdAt: -1 }),
    StudentHistory.find({ org: code }).sort({ createdAt: -1 }),
    StudentSummary.find({ org: code }),
    EmployeeSummary.find({ org: code }),
  ]);

  const rawSummary = studentSummary.map((entry) => ({
    ...entry._doc,
    name: normalizeTexts(entry.name),
    percentage:
      entry.total > 0 ? Math.round((entry.attended / entry.total) * 100) : 0,
  }));

  const summaryMap = {};
  rawSummary.forEach((entry) => {
    if (!summaryMap[entry.code]) {
      summaryMap[entry.code] = {
        code: entry.code,
        name: entry.name,
        department: entry.department,
        month: entry.month,
        subjects: [],
      };
    }
    summaryMap[entry.code].subjects.push({
      subject: entry.subject || "—",
      attended: entry.attended,
      total: entry.total,
      percentage: entry.percentage,
    });
  });

  const studentSummaryGrouped = Object.values(summaryMap).map((student) => ({
    ...student,
    overallPercentage:
      student.totalClasses > 0
        ? Math.round((student.totalAttended / student.totalClasses) * 100)
        : 0,
  }));
  
  return {
    popupMessage: null,
    popupType: null,
    orgType: user.orgType,
    isSetupDone: user.setup.done,
    isSubjectsUploaded: user.setup.subjectsUploaded,
    isScheduleUploaded: user.setup.scheduleUploaded,
    loginLog: loginLog.map((l) => ({
      ...l._doc,
      name: normalizeTexts(l.name),
    })),
    registerLog: registerLog.map((l) => ({
      ...l._doc,
      name: normalizeTexts(l.name),
    })),
    activeEmployeeSessions,
    activeStudentSessions,
    employeeHistory: employeeHistory.map((session) => ({
      ...session._doc,
      history: session.history.map((entry) => ({
        code: entry.code,
        name: normalizeTexts(entry.name),
        status: entry.status,
        checkIn: entry.checkIn,
        checkOut: entry.checkOut,
      })),
    })),
    studentHistory: studentHistory.map((session) => ({
      ...session._doc,
      history: session.history.map((entry) => ({
        code: entry.code,
        name: normalizeTexts(entry.name),
        sessionKey: entry.sessionKey,
        date: entry.date,
        isMarked: entry.isMarked,
      })),
    })),
    employeeSummary: employeeSummary.map((entry) => ({
      ...entry._doc,
      name: normalizeTexts(entry.name),
      percentage:
        entry.total > 0 ? Math.round((entry.attended / entry.total) * 100) : 0,
    })),
    studentSummaryGrouped,
    ...overrides,
  };
};
