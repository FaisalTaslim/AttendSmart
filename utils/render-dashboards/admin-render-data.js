const LoginLogs = require("../../models/logs/login");
const RegisterLogs = require("../../models/logs/register");
const ActiveEmployeeSession = require("../../models/attendance/active-employee-session");
const ActiveStudentSession = require("../../models/attendance/active-student-session");
const EmployeeHistory = require("../../models/logs/employee-attendance-history");
const StudentHistory = require("../../models/logs/student-attendance-history");

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
  ] = await Promise.all([
    LoginLogs.find({ org: code }).sort({ createdAt: -1 }),
    RegisterLogs.find({ org: code }).sort({ createdAt: -1 }),
    ActiveEmployeeSession.find({ org: code }),
    ActiveStudentSession.find({ org: code }),
    EmployeeHistory.find({ org: code }).sort({ createdAt: -1 }),
    StudentHistory.find({ org: code }).sort({ createdAt: -1 }),
  ]);

  return {
    popupMessage: null,
    popupType: null,
    orgType: user.orgType,
    isSetupDone: user.setup.done,
    isSubjectsUploaded: user.setup.subjectsUploaded,
    isScheduleUploaded: user.setup.scheduleUploaded,
    loginLog: loginLog.map((l) => ({ ...l._doc, name: normalizeTexts(l.name) })),
    registerLog: registerLog.map((l) => ({ ...l._doc, name: normalizeTexts(l.name) })),
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
    ...overrides,  // lets you override popupMessage, popupType etc per call
  };
};