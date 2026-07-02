const resolveUserModel = require("../../../utils/functions/resolve-user-models");
const LoginLogs = require("../../../models/logs/login");
const RegisterLogs = require("../../../models/logs/register");
const ActiveEmployeeSession = require("../../../models/attendance/active-employee-session");
const ActiveStudentSession = require("../../../models/attendance/active-student-session");
const EmployeeHistory = require("../../../models/logs/employee-attendance-history");
const StudentHistory = require("../../../models/logs/student-attendance-history");
const StudentSummary = require("../../../models/statistics/student-summary");
const EmployeeSummary = require("../../../models/statistics/employee-summary");

function normalizeText(string = "") {
  const words = string.split(" ");
  return words
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .trim();
}


async function returnLoginLog(user) {
  const loginLog = await LoginLogs.find({ org: user.code }).lean();
  return loginLog.map((log) => {
    return {
      ...log,
      name: normalizeText(log.name),
    };
  });
}

async function returnRegisterLog(user) {
  const registerLog = await RegisterLogs.find({ org: user.code }).lean();
  return registerLog.map((log) => {
    return {
      ...log,
      name: normalizeText(log.name),
    };
  });
}

async function returnEmployeeHistory(user) {
  const employeeHistory = await EmployeeHistory.find({ org: user.code }).lean();
  return employeeHistory.map((log) => {
    return {
      ...log,
      history: log.history.map((users) => {
        return {
          ...users,
          name: normalizeText(users.name),
        };
      }),
    };
  });
}

async function returnStudentHistory(user) {
  const studentHistory = await StudentHistory.find({ org: user.code }).lean();

  return studentHistory.map((log) => ({
    ...log,
    history: log.history.map((student) => ({
      ...student,
      name: normalizeText(student.name),
    })),
  }));
}

async function returnStudentSummary(user) {
  const studentSummary = await StudentSummary.find({ org: user.code }).lean();

  const rawSummary = studentSummary.map((entry) => ({
    ...entry,
    name: normalizeText(entry.name),
    percentage:
      entry.total > 0 ? Math.round((entry.attended / entry.total) * 100) : 0,
  }));

  const summaryMap = {};
  rawSummary.forEach((entry) => {
    const key = `${entry.code}-${entry.month}`;
    if (!summaryMap[key]) {
      summaryMap[key] = {
        code: entry.code,
        name: entry.name,
        department: entry.department,
        month: entry.month,
        subjects: [],
      };
    }
    summaryMap[key].subjects.push({
      subject: entry.subject || "—",
      attended: entry.attended,
      total: entry.total,
      percentage: entry.percentage,
    });
  });

  return Object.values(summaryMap).map((student) => {
    const totalAttended = student.subjects.reduce(
      (sum, s) => sum + (s.attended || 0),
      0,
    );
    const totalClasses = student.subjects.reduce(
      (sum, s) => sum + (s.total || 0),
      0,
    );
    return {
      ...student,
      overallPercentage:
        totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0,
    };
  });
}

async function returnEmployeeSummary(user) {
  const employeeSummary = await EmployeeSummary.find({ org: user.code }).lean();

  return employeeSummary.map((entry) => ({
    ...entry,
    name: normalizeText(entry.name ?? ""),
    department: normalizeText(entry.department ?? ""),
    percentage:
      entry.total > 0 ? Math.round((entry.attended / entry.total) * 100) : 0,
  }));
}
exports.display = async (req, res) => {
  const role = req.session.user.role;
  const code = req.session.user.code;
  let popupType = req.query["popup-type"] ?? null;
  let popupMessage = req.query["popup-message"] ?? null;

  const userModel = resolveUserModel(role);
  const user = await userModel.findOne({ code });

  if (!user)
    return res.render("index", {
      popupType: "error",
      popupMessage: "User not found",
    });

  const loginLog = await returnLoginLog(user);
  const registerLog = await returnRegisterLog(user);
  const activeEmployeeSessions = await ActiveEmployeeSession.find({
    org: user.code,
  }).lean();

  const activeStudentSessions = await ActiveStudentSession.find({
    org: user.code,
  }).lean();

  const employeeHistory = await returnEmployeeHistory(user);
  const studentHistory = await returnStudentHistory(user);
  const studentSummaryGrouped = await returnStudentSummary(user);
  const employeeSummary = await returnEmployeeSummary(user);

  res.render("dashboards/admin", {
    popupMessage,
    popupType,
    orgType: user.orgType,
    isSetupDone: user.setup.done,
    isSubjectsUploaded: user.setup.subjectsUploaded,
    isScheduleUploaded: user.setup.scheduleUploaded,
    loginLog,
    registerLog,
    activeEmployeeSessions,
    activeStudentSessions,
    employeeHistory,
    studentHistory,
    studentSummaryGrouped,
    employeeSummary,
  });
};
