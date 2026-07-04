const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { getMonthKey } = require('../../utils/time');

const validateFields = require('../../utils/validate-fields');
const generateCode = require('../../utils/generate-code');

const { returnOrg, returnEmployee } = require('../../services/fetch/users');
const { createEmployee } = require('../../services/create/users');
const { registerLog } = require('../../services/create/logs');
const { createEmployeeSummary } = require('../../services/create/summary');
const { sendVerificationEmail } = require('../../services/emails/send-registration-emails');

function verifyRequest(req) {
  const verify = {
    invalidFields: validateFields(Object.values(req.body)),
    passwordMatches: req.body.password === req.body.confirmPassword,
  };

  if (!Object.values(verify).every(Boolean)) {
    throw new Error('Incorrect password or missing fields!');
  }
}

async function processData(req) {
  const {
    org,
    name,
    employeeId,
    designation,
    workPlace,
    shift,
    contact,
    email,
    password,
    termsCheck,
  } = req.body;
  let state = { code: null, exists: null};
  let data = {user: null, summary: null};

  while (true) {
    state.code = generateCode(6, 'numeric');
    state.exists = await returnOrg({ code: state.code });
    if (!state.exists) break;
  }

  data.user = {
    org,
    code: state.code,
    name: name.toLowerCase().trim(),
    employeeId: employeeId.toLowerCase().trim(),
    designation: designation.toLowerCase().trim(),
    workPlace,
    shift,
    contact,
    email: email.toLowerCase().trim(),
    verification: {
      status: 'pending',
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    password: await bcrypt.hash(password, 10),
    termsCheck: (termsCheck) ? 'accepted' : 'rejected',
  };

  data.summary = {
    org,
    code: state.code,
    name: name.toLowerCase().trim(),
    department: designation.toLowerCase().trim(),
    shift,
    month: getMonthKey(),
  }

  return data;
}

exports.register_emp = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let object = { log: null , params: null};
  const data = await processData(req);

  try {
    if (verifyRequest(req)) {
      if (await returnEmployee({ employeeId: data.user.employeeId }))
        throw new Error('Employee exists! Login to your account!');

      await createEmployee(data.user, session);
      await createEmployeeSummary(data.summary, session);

      object.log = {
        type: 'success',
        org: data.user.org,
        code: data.user.code,
        name: data.user.name,
        id: data.user.employeeId,
        role: 'employee',
        email: data.user.email,
        contact: data.user.contact,
        message: 'Successfull!!',
      };

      await registerLog(object.log, session);
      await session.commitTransaction();

      await sendVerificationEmail(
        data.user.email,
        data.user.verification.token,
        data.user.code,
        'employee',
        null,
      );

      object.params = new URLSearchParams({
          "popup-type": "warning",
          "popup-message": "Check your email to verify your account!",
        });

      return res.redirect(`/?${params}`);

    }
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    object.log = {
      type: 'failed',
      org: data.user.org ?? null,
      code: data.user.code ?? null,
      name: data.user.name ?? null,
      id: data.user.employeeId ?? null,
      role: 'employee',
      email: data.user.email ?? null,
      contact: data.user.contact ?? null,
      message: err.message,
    };

    await registerLog(object.log, session);

    object.params = new URLSearchParams({
      "popup-type": "error",
      "popup-message": err.message || "Registration failed. Please try again.",
    });

    return res.redirect(`/?${params}`);

  } finally {
    await session.endSession();
  }
};