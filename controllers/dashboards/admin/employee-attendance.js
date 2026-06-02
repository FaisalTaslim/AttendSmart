const mongoose = require('mongoose');
const session = require("express-session");
const resolveUserModel = require("../../../utils/functions/resolve-user-models");
const activeSession = require("../../../models/attendance/active-employee-session");
const Schedule = require("../../../models/schedule/schedule");
const { timeToMinutes, getMonthKey, fullweek, fullTime } = require("../../../utils/functions/time");
const generateCode = require('../../../utils/functions/generate-code');

async function returnUser(req) {
  const Model = resolveUserModel(req.session.user.role);
  return await Model.findOne({ code: req.session.user.code });
}

async function returnSchedule(userCode) {
  return await Schedule.findOne({ org: userCode });
}


exports.checkEmployeeSession = async (req, res) => {
  try {
    const userId = req.session.user.code;

    const user = await returnUser(req);
    const schedule = await returnSchedule(userId);

    if (!schedule) {
      return res.json({
        status: "not-active",
        proceed: false,
        withinWindow: false,
      });
    }

    const today = fullweek();
    const todaySchedule = schedule.week[today];

    const { hours } = fullTime();
    const shiftType = hours >= 6 && hours < 18 ? "day" : "night";

    const shiftSchedule = todaySchedule?.[shiftType];
    const grace = schedule.grace;

    const { hours: h, minutes: m } = fullTime();
    const currentMinutes = timeToMinutes(h, m);

    const [startH, startM] = shiftSchedule.check_in.split(":").map(Number);
    const [endH, endM] = shiftSchedule.check_out.split(":").map(Number);

    const startMinutes = timeToMinutes(startH, startM) - grace;
    const endMinutes = timeToMinutes(endH, endM) + grace;

    const isWithinWindow =
      currentMinutes >= startMinutes &&
      currentMinutes <= endMinutes;

    const activeSessionDoc = await activeSession.findOne({ org: user.org });

    if (activeSessionDoc) {
      return res.json({
        status: "active",
        proceed: true,
        withinWindow: true,
      });
    }

    return res.json({
      status: "not-active",
      proceed: isWithinWindow,
      withinWindow: isWithinWindow,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error" });
  }
};

exports.startEmployeeSession = async (req, res) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    let expiresAt;
    const userId = req.session.user.code;
    const override = req.query.override;


    const user = await returnUser(req);
    const schedule = await returnSchedule(userId);

    const today = fullweek();
    const { hours } = fullTime();
    const shiftType = hours >= 6 && hours < 18 ? "day" : "night";

    const shiftSchedule = schedule.week[today][shiftType];

    let expiresAt;

    if (override) {
      expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    }
    else {
      expiresAt = new Date();

      const [h, m] = shiftSchedule.check_out.split(":");

      expiresAt.setHours(Number(h));
      expiresAt.setMinutes(Number(m));
      expiresAt.setMinutes(expiresAt.getMinutes() + schedule.grace);
    }
    const activeSessionDoc = await activeSession.create(
      [{
        org: user.org,
        sessionCode: generateCode(6, "numeric"),
        instigator: userId,
        shift: shiftType,
        expiresAt
      }],
      { session: dbSession }
    );

    await dbSession.commitTransaction();
    dbSession.endSession();

    return res.json({
      status: "ok",
      session: activeSessionDoc
    });

  } catch (err) {
    await dbSession.abortTransaction();
    dbSession.endSession();

    console.error(err);
    return res.json({ status: "error" });
  }
};