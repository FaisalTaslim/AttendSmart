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

exports.checkEmployeeSession = async (req, res) => {
  console.log('checkEmployeeSession called')
  try {
    const userId = req.session.user.code;

    const user = await returnUser(req);
    const schedule = await returnSchedule(user.code);

    if (!schedule) {
      return res.json({
        status: "not-active",
        proceed: false,
        withinWindow: false,
      });
    }

    const today = fullweek();
    const todaySchedule = schedule.week?.[today];

    if (!todaySchedule) {
      return res.json({
        status: "not-active",
        proceed: false,
        withinWindow: false,
        message: "No schedule for today",
      });
    }

    const { hours, minutes, now } = fullTime();
    const currentMinutes = timeToMinutes(hours, minutes);

    const shiftType = hours >= 6 && hours < 18 ? "day" : "night";
    const shiftSchedule = todaySchedule?.[shiftType];

    if (!shiftSchedule) {
      return res.json({
        status: "error",
        message: "Shift not defined",
      });
    }

    const [startH, startM] = shiftSchedule?.check_in.split(":").map(Number);
    const [endH, endM] = shiftSchedule?.check_out.split(":").map(Number);

    const grace = schedule.grace || 0;

    const startMinutes = timeToMinutes(startH, startM) - grace;
    const endMinutes = timeToMinutes(endH, endM) + grace;

    let isWithinWindow;

    if (startMinutes <= endMinutes) {
      isWithinWindow =
        currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      isWithinWindow =
        currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }

    const activeSessionDoc = await activeSession.findOne({ org: user.org });

    if (activeSessionDoc) {
      return res.json({
        status: "active",
        proceed: false,
        withinWindow: true,
        sessionCode: activeSessionDoc.sessionCode
      });
    }

    return res.json({
      status: "not-active",
      proceed: true,
      withinWindow: isWithinWindow,
      scheduleTime: `${formatTime(startH, startM)} - ${formatTime(endH, endM)}`,
      currentTime: formatTime(now.getHours(), now.getMinutes()),
      shift: shiftType,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: err.message,
      stack: err.stack,
    });
  }
};

exports.startEmployeeSession = async (req, res) => {
  console.log('startEmployeeSession called')
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const type = req.query.type;
    const override = req.query.override === "true";

    if (type === "check-in") {
      const userId = req.session.user.code;

      const user = await returnUser(req);
      const schedule = await returnSchedule(user.code);

      const today = fullweek();
      const { hours } = fullTime();

      const shiftType = hours >= 6 && hours < 18 ? "day" : "night";
      const shiftSchedule = schedule.week?.[today]?.[shiftType];

      if (!shiftSchedule) {
        throw new Error("Shift schedule missing");
      }

      const [h, m] = shiftSchedule.check_out.split(":").map(Number);

      let expiresAt = new Date();

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

      const [created] = await activeSession.create(
        [
          {
            org: user.code,
            sessionCode: generateCode(6, "numeric"),
            instigator: userId,
            shift: shiftType,
            type: "check-in",
            expiresAt,
          },
        ],
        { session: dbSession },
      );

      const month = getMonthKey();
      
      const summary = await EmployeeSummary.updateMany(
        { org: user.code, shift: shiftType, month },
        { $inc: { total: 1 } },
        { session: dbSession },
      );

      await logSession.create(
        [
          {
            org: user.code,
            sessionCode: created.sessionCode,
            instigator: userId,
            shift: shiftType,
          },
        ],
        { session: dbSession },
      );

      await dbSession.commitTransaction();
      dbSession.endSession();

      return res.json({
        status: "ok",
        session: created,
        sessionCode: created.sessionCode,
      });
    } else {
      const user = req.session.user.code;
      const { hours } = fullTime();
      const shiftType = hours >= 6 && hours < 18 ? "day" : "night";
      const isActiveSession = await activeSession.findOne({
        org: user,
        shift: shiftType,
      });

      if (!isActiveSession) {
        return res.json({
          status: "error",
          message: "No active session found",
        });
      }

      await activeSession.findOneAndUpdate(
        { org: user, shift: shiftType },
        {
          $set: {
            type: "check-out",
          },
        },
      );

      return res.json({
        status: "ok",
        message: "session-type changed successfully!",
      });
    }
  } catch (err) {
    await dbSession.abortTransaction();
    dbSession.endSession();

    console.error(err);

    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
