const mongoose = require("mongoose");
const resolveUserModel = require("../../utils/resolve-user-models");

const {
  returnActiveStudentSession,
  returnSchedule,
} = require("../../services/fetch/attendance");

const { updateActiveStudentSession } = require('../../services/update/attendance');
const { returnStudentAttendanceHistory, returnIndex, } = require("../../services/fetch/logs");
const { updateStudentAttendanceHistory } = require('../../services/update/logs');

const validateFields = require("../../utils/validate-fields");

function verifyRequest(sessionData, object) {
  if (!validateFields(Object.values([sessionData?.code, sessionData?.role]))) {
    throw new Error("Missing session data!");
  }

  if (!validateFields(Object.values(object.qr))) {
    throw new Error("Invalid QR data!");
  }

  if (!object.user) {
    throw new Error("User not found!");
  }

  if (!object.activeSession) {
    throw new Error("Active session not found!");
  }

  return true;
}

async function processData(sessionData, qrData) {
  let object = { user: null, activeSession: null, success: null, joined: null, qr: null };
  let state = { Model: null };

  state.Model = resolveUserModel(sessionData?.role);
  object.user = await state.Model.findOne({ code: sessionData?.code });
  object.qr = qrData;
  object.activeSession = await returnActiveStudentSession({ org: object.user?.org, sessionCode: qrData?.sessionCode });

  object.success = {
    success: true,
    message: 'Redirecting...',
    user: 'student',
    type: sessionData.role,
    sessionCode: qrData.sessionCode,
    dept: (sessionData.role === 'college-student') ? object.user.dept : object.user.standard,
    subject: (qrData.subject === 'null') ? null : qrData.subject,
    key: qrData.sessionKey,
  }

  object.joined = {
    code: sessionData.code,
    name: object.user?.name,
    sessionKey: qrData.sessionKey,
    scannedAt: new Date(),
    attendanceMarked: false,
    attendanceMarkedAt: null,
  }

  verifyRequest(sessionData, object);
  return object;
}

exports.request = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { qrData } = req.body;
    let object = { data: null };
    let state = { isAlreadyJoined: null };

    object.data = await processData(req.session.user, JSON.parse(qrData));

    state.isAlreadyJoined = object.data?.activeSession.joined.some((d) => d.code === req.session.user.code);
    if (state.isAlreadyJoined) return res.json(object.data?.success);

    await updateActiveStudentSession(
      { org: object.data.user.org, sessionCode: object.data?.qr.sessionCode },
      { joined: object.data.joined },
      session,
    )

    await updateStudentAttendanceHistory(
      { org: object.data?.user?.org, sessionCode: object.data?.qr?.sessionCode, subject: object.data?.qr?.subject, department: object.data?.success?.dept },
      {
        history: {
          code: object.data?.user?.code,
          sessionKey: object.data?.qr.sessionKey,
          name: object.data?.user?.name,
          date: new Date(),
          isMarked: false,
        },
      },
      'push',
      session
    );

    await session.commitTransaction();
    return res.json(object.data?.success);

  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    return res.json({
      success: false,
      message: err.message ?? 'Something Went Wrong',
    });
    
  } finally {
    session.endSession();
  }
};