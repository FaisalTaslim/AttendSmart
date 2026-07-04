const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const validateFields = require('../../utils/validate-fields');
const generateCode = require('../../utils/generate-code');

const { returnOrg } = require('../../services/fetch/users');
const { updateAdmin } = require('../../services/update/users');
const { registerLog } = require('../../services/create/logs');
const { createOrg } = require('../../services/create/users');
const { sendVerificationEmail } = require('../../services/emails/send-registration-emails');

function verifyRequest(req, org) {
  const verify = {
    'invalidFields': (validateFields(Object.values(req.body)) && validateFields(Object.values(req.body.admin[0]))),
    'passwordMismatch': (req.body.admin[0].password === req.body.confirmPassword),
  }

  try {
    let result = () => {
      for (const key in verify) {
        if (!verify[key]) {
          return false;
        }
      }
      return true;
    }

    if (result() == false) {
      throw new Error('Incorrect Password or missing fields! Try agian later!');
    }
  } catch (err) {
    throw err;
  }
}

async function processData(req) {
  const { organization, branch, address, type, website, attendanceMethod, termsCheck, admin, confirmPassword } = req.body;
  const { name, adminId, email, contact } = req.body.admin[0];
  let state = { code: null, exists: null };

  while (true) {
    state.code = generateCode(6, "numeric");
    state.exists = await returnOrg({ code: state.code });
    if (!state.exists) break;
  }

  const data = {
    code: state.code,
    org: organization.toLowerCase().trim(),
    branch: branch.toLowerCase().trim(),
    address: address.toLowerCase().trim(),
    type: type,
    website: website.toLowerCase().trim(),
    attendanceMethod: (type === 'corporate') ? null : attendanceMethod,
    admin: [
      {
        name: name.toLowerCase().trim(),
        adminId: adminId.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        contact: contact,
        password: await bcrypt.hash(req.body.admin[0].password, 10),
        role: 'admin',
      }
    ],
    verification: {
      status: 'pending',
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    setup: {
      subjectsUploaded: (type === 'corporate') ? true : false,
      scheduleUploaded: false,
      done: false,
    }
  }

  return data;
}

exports.adm = async (req, res) => {
  const session = mongoose.startSession();
  await session.startTransaction();

  let object = { org: null, log: null };
  const data = await processData(req);
  object.org = await returnOrg({ org: data.org, branch: data.branch });

  try {
    if (verifyRequest(req, object.org)) {
      if (object.org) {
        await updateAdmin(object.org.code, data.admin[0], 'pushAdmin', session);

        object.log = {
          type: 'success',
          org: object.org.code,
          name: data.admin[0].name,
          role: 'admin',
          id: data.admin[0].adminId,
          email: data.admin[0].email,
          contact: data.admin[0].contact,
          message: 'Successful!!',
          approvalStatus: null,
        }

        await registerLog(object.log, session);
      }
      else {
        await updateAdmin(await data.code, data, 'normal', session);

        object.log = {
          type: 'success',
          org: data.code,
          name: data.admin[0].name,
          id: data.admin[0].adminId,
          role: 'admin',
          email: data.admin[0].email,
          contact: data.admin[0].contact,
          message: 'Successful!!',
          approvalStatus: null,
        }

        await registerLog(object.log, session);

        await sendVerificationEmail(data.admin[0].email, (await data).verification.token, (await data).code, 'admin', null);
        await session.commitTransaction();
      }
    }
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    if (object.org) {
      object.log = {
        type: 'failed',
        org: object.org.code ?? null,
        name: data.admin[0].name ?? null,
        role: 'admin',
        id: data.admin[0].adminId ?? null,
        email: data.admin[0].email ?? null,
        contact: data.admin[0].contact ?? null,
        message: 'Successful!!',
        approvalStatus: null,
      }
    }
    else {
      object.log = {
        type: 'failed',
        org: data.code ?? null,
        name: data.admin[0].name ?? null,
        id: data.admin[0].adminId ?? null,
        role: 'admin',
        email: data.admin[0].email ?? null,
        contact: data.admin[0].contact ?? null,
        message: 'Successful!!',
        approvalStatus: null,
      }
    }

    await registerLog(object.log, session);
    const params = new URLSearchParams({
      "popup-type": "error",
      "popup-message": err.message || "Registration failed. Please try again.",
    });

    return res.redirect(`/?${params}`);
  } finally {
    await session.endSession();
  }
}