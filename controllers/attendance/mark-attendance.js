const mongoose = require("mongoose");
const resolveUserModel = require("../../utils/resolve-user-models");
const validateFields = require("../../utils/validate-fields");
const { fullTime, fullweek, timeToMinutes, getMonthKey, } = require("../../utils/time");

const {
  returnEmployeeAttendanceHistory,
  returnStudentAttendanceHistory,
  returnIndex,
} = require("../../services/fetch/logs");

const {
  returnActiveStudentSession,
  returnActiveEmployeeSession,
  returnSchedule,
} = require("../../services/fetch/attendance");

const { updateEmployeeSummary, updateStudentSummary } = require('../../services/update/summary');
const { returnEmployeeSummary, returnStudentSummary, } = require('../../services/fetch/summary');
const { updateEmployeeAttendanceHistory, updateStudentAttendanceHistory } = require('../../services/update/logs');


function verifyRequest(body, activeSession, history, fetchedUser, summary) {
  if (body.user === 'employee') {
    const verify = validateFields([
      body.code,
      body.sessionCode,
      body.shift,
      body.type,
      body.user,
    ]);

    if (!verify) { throw new Error('Missing Required Data for Processing!'); }
  }
  else {
    console.log(body);
    const verify = validateFields([
      body.code,
      body.sessionCode,
      body.dept,
      body.subject,
      body.type,
      body.user,
    ]);

    if (!verify) { throw new Error('Missing Required Data for Processing!'); }
  }

  if ((!activeSession) || !history || !summary) {
    throw new Error('Missing Documents for Processing!');
  }

  if (body.user === 'employee' && (fetchedUser?.shift !== activeSession.shift))
    throw new Error(`Employee doesn't belong to ${activeSession.shift} shift`);

  const index = returnIndex(history, fetchedUser?.code);

  if (index < 0) {
    if (body.user === "employee") {
      if (body.type === "check-out") {
        throw new Error(
          "User did not check-in earlier. Check-out forbidden!"
        );
      }
    } else {
      throw new Error(
        "User did not scan QR code before! Attendance forbidden!"
      );
    }
  }

  return true;
}

async function processData(body) {
  let object = { fetchedUser: null, activeSession: null, history: null, summary: null };
  let state = { Model: null };
  let org, sessionCode;

  state.Model =
    body.user === "employee"
      ? resolveUserModel(body.user)
      : resolveUserModel(body.type);

  object.fetchedUser = await state.Model.findOne({ code: body.code });
  org = object.fetchedUser?.org;
  sessionCode = body.sessionCode;

  object.activeSession =
    body.user === "employee"
      ? await returnActiveEmployeeSession({ org, sessionCode })
      : await returnActiveStudentSession({ org, sessionCode });

  object.history =
    body.user === 'employee'
      ? await returnEmployeeAttendanceHistory({ org, sessionCode })
      : await returnStudentAttendanceHistory({ org, sessionCode, subject: body.subject, department: body.dept });

  object.summary =
    body.user === 'employee'
      ? await returnEmployeeSummary({ org, code: body.code, shift: body.shift, month: getMonthKey() }, 'one')
      : await returnStudentSummary({ org, code: body.code, subject: body.subject, department: body.dept, month: getMonthKey() }, 'one');

  console.log({
    fetchedUser: !!object.fetchedUser,
    activeSession: !!object.activeSession,
    history: !!object.history,
    summary: !!object.summary,
  });

  verifyRequest(body, object.activeSession, object.history, object.fetchedUser, object.summary);

  return object;
}

exports.request = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let object = { data: null, schedule: null };
    let state = { index: null };
    object.data = await processData(req.body);

    const { sessionCode, type, user, code, dept, subject, key, shift } = req.body;

    const currentMinutes = timeToMinutes(
      fullTime().hours,
      fullTime().minutes,
    );

    object.schedule = await returnSchedule({ org: object.data.fetchedUser.org })

    const startMinutes = timeToMinutes(
      object.schedule?.
        week
        ?.[fullweek()]?.[shift]?.check_in?.split(":")[0],

      object.schedule?.
        week
        ?.[fullweek()]?.[shift]?.check_in?.split(":")[1],
    );

    const history = object.data.history;
    state.index = returnIndex(object.data.history, code);
    console.log(user);

    if (user === 'employee') {
      if (type === "check-in") {
        if (state.index < 0) {
          await updateEmployeeAttendanceHistory(
            { org: object.data.fetchedUser.org, sessionCode },
            {
              history: {
                code: code,
                name: object.data.fetchedUser.name,
                checkIn: new Date(),
                checkOut: null,
                status:
                  (currentMinutes > (startMinutes + object.schedule.grace)) ? "late" : "on-time",
              },
            },
            'push',
            session
          );
        }
      }
      else if (type === "check-out") {
        if (history.history[state.index]?.checkOut !== null) {
          return res.json({
            success: false,
            message: "Attendance already marked",
          });
        }

        await updateEmployeeSummary(
          { org: object.data.fetchedUser.org, code: code, shift: shift, month: getMonthKey() },
          { attended: 1 },
          'one',
          session
        );

        await updateEmployeeAttendanceHistory(
          { org: object.data.fetchedUser.org, sessionCode },
          {
            [`history.${state.index}.checkOut`]: new Date()
          },
          "set",
          session
        );
      }
    }
    else {
      const isMarked = history.history[state.index].isMarked;

      if (!isMarked) {
        await updateStudentSummary(
          { org: object.data.fetchedUser.org, code: code, month: getMonthKey(), subject: subject, department: dept },
          { attended: 1 },
          'one',
          session
        );

        await updateStudentAttendanceHistory(
          { org: object.data.fetchedUser.org, sessionCode: sessionCode, subject: subject, department: dept },
          {
            [`history.${state.index}.isMarked`]: true,
          },
          'set',
          session
        );

      } else {
        return res.status(400).json({
          success: false,
          message: "Attendance already marked",
        });
      }
    }

    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Attendance marked successfully",
    });

  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Attendance marking failed",
    });
  } finally {
    session.endSession();
  }
};