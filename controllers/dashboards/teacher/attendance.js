const resolveUserModel = require("../../../utils/functions/resolve-user-models");
const activeSession = require("../../../models/attendance/active-student-session");
const logSession = require("../../../models/logs/student-attendance-history");
const generateCode = require("../../../utils/functions/generate-code");
const mongoose = require("mongoose");

async function renderTeacherDashboard(req, res, popupMessage, popupType) {
  const userModel = resolveUserModel(req.session.user.role);
  const user = await userModel.findOne({ code: req.session.user.code });

  return res.render("dashboards/teacher", {
    popupMessage,
    popupType,
    isFaceUploaded: user?.setup?.faceUploaded,
    isSetupDone: user?.setup?.done,
  });
}

exports.startStudentSession = async (req, res) => {
  const { org, dept, majors, minors, optionals } = req.body;
  const subject = majors ?? minors ?? optionals;

  if (!subject) {
    return renderTeacherDashboard(
      req,
      res,
      "No subjects selected",
      "error",
    );
  }

  const dbSession = await mongoose.startSession();
  let user;
  let sessionCode;

  try {
    await dbSession.withTransaction(async () => {
      const userModel = resolveUserModel(req.session.user.role);
      user = await userModel
        .findOne({ code: req.session.user.code })
        .session(dbSession);

      if (!user) {
        throw new Error("Authenticated user not found in database");
      }

      await activeSession.deleteMany(
        { org, department: dept, subject },
        { session: dbSession },
      );

      sessionCode = generateCode(10, "alphanumeric");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await activeSession.create(
        [
          {
            org,
            sessionCode,
            code: user.code,
            instigator: user.name,
            department: dept,
            joined: [],
            subject,
            expiresAt,
          },
        ],
        { session: dbSession },
      );

      await logSession.create(
        [
          {
            org,
            sessionCode,
            instigator: user.name,
            subject,
            department: dept,
            history: [],
          },
        ],
        { session: dbSession },
      );
    });

    const query = new URLSearchParams({
      instigator: user.name,
      subject,
      dept,
      "session-code": sessionCode,
    });

    return res.redirect(`/dashboard/employee/teacher/qr?${query.toString()}`);
  } catch (err) {
    console.error("startStudentSession transaction failed:", err);
    return renderTeacherDashboard(
      req,
      res,
      "Failed to start session. Please try again.",
      "error",
    );
  } finally {
    dbSession.endSession();
  }
};