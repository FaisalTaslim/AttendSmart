const activeSession = require("../../../models/attendance/active-student-session");
const logSession = require("../../../models/logs/student-attendance-history");
const resolveUserModel = require("../../../utils/functions/resolve-user-models");
const mongoose = require("mongoose");

exports.processQr = async (req, res) => {
  try {
    const Model = resolveUserModel(req.session.user.role);
    const user = await Model.findOne({ code: req.session.user.code });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const { qrData } = req.body;

    if (!qrData) {
      return res.json({
        success: false,
        message: "QR data missing",
      });
    }

    const parsed = JSON.parse(qrData);

    const isActiveSession = await activeSession.findOne({
      org: user.org,
      sessionCode: parsed.sessionCode,
    });

    if (!isActiveSession) {
      return res.json({
        success: false,
        message: "Session not found",
      });
    }

    const isAlreadyJoined = isActiveSession.joined.some(
      (data) => data.code === user.code,
    );

    if (isAlreadyJoined) {
      return res.json({
        success: false,
        message: "User already joined",
      });
    }

    await activeSession.findOneAndUpdate(
      { org: user.org, sessionCode: parsed.sessionCode },
      {
        $push: {
          joined: {
            code: user.code,
            name: user.name,
            sessionKey: parsed.sessionKey,
            scannedAt: Date.now(),
            attendanceMarked: false,
            attendanceMarkedAt: null,
          },
        },
      },
    );

    await logSession.findOneAndUpdate(
      { org: user.org, sessionCode: parsed.sessionCode },
      {
        $push: {
          history: {
            code: user.code,
            sessionKey: parsed.sessionKey,
            name: user.name,
            date: Date.now(),
            isMarked: false,
          },
        },
      },
    );

    req.session.attendance = {
      sessionCode: parsed.sessionCode,
      sessionKey: parsed.sessionKey,
    };

    return res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return res.json({
      success: false,
      message: "Invalid QR",
    });
  }
};
