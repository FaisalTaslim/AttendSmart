const mongoose = require("mongoose");
const session = require("express-session");
const resolveUserModel = require("../../../utils/functions/resolve-user-models");
const activeSession = require("../../../models/attendance/active-employee-session");
const logSession = require("../../../models/logs/employee-attendance-history");
const Schedule = require("../../../models/schedule/schedule");
const EmployeeSummary = require("../../../models/statistics/employee-summary");
const {
  timeToMinutes,
  getMonthKey,
  fullweek,
  fullTime,
  formatTime,
} = require("../../../utils/functions/time");
const generateCode = require("../../../utils/functions/generate-code");

async function returnUser(req) {
  const Model = resolveUserModel(req.session.user.role);
  return await Model.findOne({ code: req.session.user.code });
}

async function returnSchedule(userCode) {
  return await Schedule.findOne({ org: userCode });
}

exports.startEmployeeSession = async (req, res) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const { shift, type } = req.body;
  const org = req.session.user.code;

  try {
    let schedule;
    let expiresAt;

    if (type == "check-in") {
      const sessionIsActive = await activeSession.findOne({
        org,
        shift,
        type: "check-in",
      });

      if (sessionIsActive) {
        return res.render("dashboards/capture-attendance", {
          popupType: "success",
          popupMessage: "Active Session Found! Redirected to the page!",
          isUser: "employee",
          type: "check-in",
          dept: null,
          sessionCode: sessionIsActive.sessionCode,
          subject: null,
          key: null,
        });
      }

      schedule = await returnSchedule(org);

      const today = fullweek();
      const { hours } = fullTime();
      const shiftSchedule = schedule.week?.[today]?.[shift];

      if (!shiftSchedule) throw new Error("Shift schedule missing");

      const [h, m] = shiftSchedule.check_out.split(":").map(Number);

      expiresAt = new Date();
      expiresAt.setHours(h);
      expiresAt.setMinutes(m);
      expiresAt.setSeconds(0);
      expiresAt.setMilliseconds(0);

      const grace = schedule.grace || 0;

      if (expiresAt <= new Date()) {
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        expiresAt.setMinutes(expiresAt.getMinutes() + grace);
      } else {
        expiresAt.setMinutes(expiresAt.getMinutes() + grace);
      }

      const activeSessionDoc = {
        org,
        sessionCode: generateCode(6, "numeric"),
        shift,
        type: "check-in",
        instigator: req.session.user.code,
        expiresAt,
      };

      await activeSession.create([activeSessionDoc], { session: dbSession });

      await EmployeeSummary.updateMany(
        { org, shift, month: getMonthKey() },
        { $inc: { total: 1 } },
        { session: dbSession },
      );

      await logSession.create(
        [
          {
            org,
            sessionCode: activeSessionDoc.sessionCode,
            instigator: org,
            shift: shift,
          },
        ],
        { session: dbSession },
      );

      await dbSession.commitTransaction();
      dbSession.endSession();

      return res.render("dashboards/capture-attendance", {
        popupType: "success",
        popupMessage: "Session started successfully",
        isUser: "employee",
        type,
        dept: null,
        sessionCode: activeSessionDoc.sessionCode,
        subject: null,
        key: null,
      });
    } else {
      const { hours } = fullTime();
      const sessionIsActive = await activeSession.findOne({ org, shift });

      if (!sessionIsActive) {
        return res.render("dashboards/admin", {
          popupType: "error",
          popupMessage: "No active Session",
          orgType: returnUser()?.orgType,
          isSubjectsUploaded: returnUser()?.setup.subjectsUploaded,
          isScheduleUploaded: returnUser()?.setup.scheduleUploaded,
          isSetupDone: returnUser()?.setup.done,
        });
      }

      if (sessionIsActive.type === "check-in") {
        await activeSession.findOneAndUpdate(
          { org, shift },
          {
            $set: {
              type: "check-out",
            },
          },
        );
      }

      return res.render("dashboards/capture-attendance", {
        popupType: "success",
        popupMessage: "Session started successfully",
        isUser: "employee",
        type,
        dept: null,
        sessionCode: sessionIsActive.sessionCode,
        subject: null,
        key: null,
      });

      await dbSession.commitTransaction();
      dbSession.endSession();
    }
  } catch (err) {
    await dbSession.abortTransaction();
    dbSession.endSession();

    return res.render("dashboards/admin", {
      popupType: "error",
      popupMessage: "No active Session",
      orgType: returnUser()?.orgType,
      isSubjectsUploaded: returnUser()?.setup.subjectsUploaded,
      isScheduleUploaded: returnUser()?.setup.scheduleUploaded,
      isSetupDone: returnUser()?.setup.done,
    });
  }
};
