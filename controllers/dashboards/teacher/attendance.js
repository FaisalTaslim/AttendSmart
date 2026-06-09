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

      if (!subject) {
        const orgDoc = await Org.findOne(
          { code: org },
          { attendanceMethod: 1 },
        );

        const attendanceType = orgDoc?.attendanceMethod;

        if (user.workPlace === "school" && attendanceType === "one-time")
          subject = null;
        else {
          return renderTeacherDashboard(
            req,
            res,
            "No subjects selected",
            "error",
          );
        }
      }
      else {
        const orgDoc = await Org.findOne(
          { code: org },
          { attendanceMethod: 1 },
        );
        const attendanceType = orgDoc?.attendanceMethod;

        if(subject && attendanceType === "one-time") {
          return renderTeacherDashboard(
            req,
            res,
            'Subject must be null for your attendanceType!',
            "error"
          )
        }
      }

      sessionCode = generateCode(10, "numeric");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const isActiveSession = await activeSession.findOne({
        org,
        dept,
        instigator: user.code,
        subject,
      });

      if (isActiveSession) {
        return res.render("attendance/qr", {                                                                                  
          popupType: "success",
          popupMessage: "Session already exists! Redirected to the page!",
          instigatorName: user.name,
          instigator: user.code,
          subject,
          dept,
          sessionCode,
          sessionMins: 15,
        });
      }

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

      const result = await StudentSummary.updateMany(
        { org, department: dept, subject, month },
        {
          $inc: {
            total: 1,
          },
        },
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

      
      return res.render("attendance/qr", {
        popupType: "success",
        popupMessage: "Session started successfully!",
        instigatorName: user.name,
        instigator: user.code,
        subject,
        dept,
        sessionCode,
        sessionMins: 15,
      });
    });
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
