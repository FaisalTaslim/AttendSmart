const Org = require("../../../models/users/organization");
const resolveUserModel = require("../../../utils/functions/resolve-user-models");
const activeSession = require("../../../models/attendance/active-student-session");
const logSession = require("../../../models/logs/student-attendance-history");
const StudentSummary = require("../../../models/statistics/student-summary");
const generateCode = require("../../../utils/functions/generate-code");
const { getMonthKey } = require("../../../utils/functions/time");
const mongoose = require("mongoose");

async function renderTeacherDashboard(req, res, popupMessage, popupType) {
  const userModel = resolveUserModel(req.session.user.role);
  const user = await userModel.findOne({ code: req.session.user.code });

  return res.render("dashboards/teacher", {
    popupMessage,
    popupType,
    isFaceUploaded: user?.setup?.faceUploaded,
    isSetupDone: user?.setup?.done,
    workPlace: user.workPlace,
  });
}

exports.startStudentSession = async (req, res) => {
  const { org, dept, majors, minors, optionals } = req.body;
  let subject = majors ?? minors ?? optionals;

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  let user;
  let sessionCode;
  let alreadyExisted = false;

  try {
    const userModel = resolveUserModel(req.session.user.role);
    user = await userModel.findOne({ code: req.session.user.code }, null, {
      session: dbSession,
    });

    if (!user) throw new Error("Unauthorized access! User not found!");

    const orgDoc = await Org.findOne(
      { code: org },
      { attendanceMethod: 1 },
      { session: dbSession },
    );
    const attendanceType = orgDoc?.attendanceMethod;

    if (!subject) {
      if (user.workPlace === "school" && attendanceType === "one-time") {
        subject = null;
      } else {
        throw new Error("No subjects selected");
      }
    } else {
      if (attendanceType === "one-time") {
        throw new Error("Subject must be null for your attendanceType!");
      }
    }

    const existing = await activeSession.findOne(
      { org, department: dept, instigator: user.code, subject },
      null,
      { session: dbSession },
    );

    if (existing) {
      sessionCode = existing.sessionCode;
      alreadyExisted = true;
    } else {
      sessionCode = generateCode(10, "numeric");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await activeSession.create(
        [
          {
            org,
            sessionCode,
            code: user.code,
            instigator: user.code,
            department: dept,
            subject,
            expiresAt,
          },
        ],
        { session: dbSession },
      );

      const month = getMonthKey();
      await StudentSummary.updateMany(
        { org, department: dept, subject, month },
        { $inc: { total: 1 } },
        { session: dbSession },
      );

      await logSession.create(
        [
          {
            org,
            sessionCode,
            instigator: user.code,
            subject,
            department: dept,
            history: [],
          },
        ],
        { session: dbSession },
      );
    }

    await dbSession.commitTransaction();

    return res.render("attendance/qr", {
      popupType: "success",
      popupMessage: alreadyExisted
        ? "Session already exists! Redirected to the page!"
        : "Session started successfully!",
      instigatorName: user.name,
      instigator: user.code,
      subject,
      dept,
      sessionCode,
      sessionMins: 15,
    });
  } catch (err) {
    await dbSession.abortTransaction();
    console.error("startStudentSession failed:", err);

    const knownErrors = [
      "No subjects selected",
      "Subject must be null for your attendanceType!",
    ];
    const message = knownErrors.includes(err.message)
      ? err.message
      : "Failed to start session. Please try again.";

    return renderTeacherDashboard(req, res, message, "error");
  } finally {
    dbSession.endSession();
  }
};
