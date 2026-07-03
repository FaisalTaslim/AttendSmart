const activeSession = require("../../../models/attendance/active-student-session");
const logSession = require("../../../models/logs/student-attendance-history");
const resolveUserModel = require("../../../utils/resolve-user-models");
const mongoose = require("mongoose");

exports.processQr = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const Model = resolveUserModel(req.session.user.role);
    const user = await Model.findOne({ code: req.session.user.code });
    const role = req.session.user.role;
    let dept;

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
        message: "QR data not found",
      });
    }

    const parsed = JSON.parse(qrData);
    console.log("parsed QR payload:", JSON.stringify(parsed));

    const isActiveSession = await activeSession.findOne({
      org: user.org,
      sessionCode: parsed.sessionCode,
    });

    if (!isActiveSession) {
      return res.json({
        success: false,
        message: "Session not found or expired! Contact your teacher",
      });
    }

    const isAlreadyJoined = isActiveSession.joined.some(
      (d) => d.code === user.code,
    );

    if (isAlreadyJoined) {
      return res.json({
        success: false,
        message:
          "You have already joined this session! Proceed to attendance marking!",
      });
    }

    session.startTransaction();

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
      { session },
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
      { session },
    );

    if (role === "school-student") dept = user.standard;
    else dept = user.dept;

    await session.commitTransaction();

    console.log(parsed.sessionKey);
    return res.json({
      success: true,
      message: "Attendance session joined successfully",
      isUser: "student",
      type: role,
      sessionCode: parsed.sessionCode,
      dept,
      subject: parsed.subject,
      key: parsed.sessionKey,
    });
  } catch (err) {
    await session.abortTransaction();

    return res.json({
      success: false,
      message: "Something went wrong!",
    });
  } finally {
    session.endSession();
  }
};
