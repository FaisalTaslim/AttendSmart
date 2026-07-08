const mongoose = require('mongoose');
const session = require('express-session');
const { getMonthKey, fullweek } = require('../../utils/time');
const generateCode = require('../../utils/generate-code');

const { returnSchedule, returnActiveEmployeeSession} = require('../../services/fetch/attendance');
const { createActiveEmployeeSession } = require('../../services/create/attendance');
const { employeeActiveSessionLog } = require('../../services/create/logs');
const { updateEmployeeSummary } = require('../../services/update/summary');
const { updateActiveEmployeeSession } = require('../../services/update/attendance');
const validateFields = require("../../utils/validate-fields");

function verifyRequest(req, shiftOfSchedule) {
  const verify = {
    invalidFields: validateFields(Object.values(req.body)),
    isShiftOfSchedule: (shiftOfSchedule) ? true : false,
  };

  if (!Object.values(verify).every(Boolean)) {
    throw new Error('Missing Fields!');
  }
}

function renderCameraPage(params, sessionCode, res) {
  if (sessionCode) {
    params.sessionCode = sessionCode;
  }

  const query = new URLSearchParams(params);

  res.redirect(`/app/capture-attendance?${query.toString()}`);
}

function getSessionExpiry(checkOutTime, grace = 0) {
  const now = new Date();
  const [hour, minute] = checkOutTime.split(':').map(Number);

  const expiresAt = new Date(now);
  expiresAt.setHours(hour, minute + grace, 0, 0);

  if (expiresAt <= now) {
    return new Date(now.getTime() + (60 + grace) * 60 * 1000);
  }

  return expiresAt;
}

function createSessionPayload(org, shift, type, expiresAt) {
    const object = {sessionDocument: null, log: null, params: null};
    const sessionCode = generateCode(6, 'alphanumeric');

    object.sessionDocument = {
      org,
      sessionCode: sessionCode,
      shift,
      type,
      instigator: org,
      expiresAt,
    };

    object.log = {
      org,
      sessionCode: sessionCode,
      instigator: org,
      shift: shift,
    };

    object.params = {
      "popupType": 'success',
      "popupMessage": 'Successful!!',
      user: 'employee',
      type,
      sessionCode: sessionCode,
      shift,
    }

    return object;
}

exports.request = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let object = {activeSession: null, schedule: null, shiftOfSchedule: null, data: null,};
  const {shift, type} = req.body;
  let state = { org: null, expiresAt: null, today: null};

  try {
    state.today = fullweek();
    state.org = req.session.user.code;
    object.schedule = await returnSchedule({ org: state.org });
    object.shiftOfSchedule = object.schedule.week?.[state.today]?.[shift];

    verifyRequest(req, object.shiftOfSchedule);

    object.activeSession = await returnActiveEmployeeSession({org: state.org, shift: shift});

    if (type === 'check-in') {
      state.expiresAt = getSessionExpiry(object.shiftOfSchedule.check_out, object.schedule.grace,);
      object.data = createSessionPayload(state.org, shift, 'check-in', state.expiresAt,);
      
      if (object.activeSession) {
        if(object.activeSession.type === 'check-in') {
          return renderCameraPage(object.data.params, object.activeSession.sessionCode, res,);
        }
        else {
          await updateActiveEmployeeSession(
            { org: state.org, shift: shift },
            { type: 'check-in' },
            session,
          );+

          await session.commitTransaction();
          return renderCameraPage(object.data.params, object.activeSession.sessionCode, res);
        }
      }

      await createActiveEmployeeSession(object.data.sessionDocument, session);

      const summary = await updateEmployeeSummary(
        { org: state.org, shift: shift, month: getMonthKey() },
        { total: 1 },
        session,
      );
      

      await employeeActiveSessionLog(object.data.log, session);
      
      await session.commitTransaction();
      return renderCameraPage(object.data.params, null, res);

    } else {
      if (!object.activeSession) {
        const params = new URLSearchParams({
          "popupType": 'error',
          "popupMessage": 'No Active Session!',
        });

        return res.redirect(`/app/admin?${params}`);
      }

      object.data = createSessionPayload(state.org, shift, 'check-out', object.activeSession.expiresAt,);

      if(object.activeSession.type === 'check-in') {
        await updateActiveEmployeeSession(
          { org: state.org, shift: shift },
          { type: 'check-out' },
          session,
        );

        await session.commitTransaction();
        return renderCameraPage(object.data.params, object.activeSession.sessionCode, res);
      }
      else {
        return renderCameraPage(object.data.params, object.activeSession.sessionCode, res);
      }
    }
  } catch(err) {
    if (session.inTransaction()) {
        await session.abortTransaction();
    }

    const params = new URLSearchParams({
      "popupType": 'error',
      "popupMessage": err.message,
    });

    res.redirect(`/app/admin?${params}`);
  } finally {
    session.endSession();
  }
};