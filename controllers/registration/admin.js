const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const validateFields = require('../../utils/validate-fields');
const generateCode = require('../../utils/generate-code');
const lowercase = require('../../utils/lowercase');

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

exports.adm = async (req, res) => {
  const session = await mongoose.startSession();

  const l = { code: null, data: null, verify: null, existing: null, exists: null, orgDoc: null, adminData: null, adm: null, setup: null, lowercased: null };

  l.adminData = {
    name: req.body.admin[0].name,
    adminId: req.body.admin[0].adminId,
    contact: req.body.admin[0].contact,
    email: req.body.admin[0].email,
  }

  adm = lowercase(adminData);

  try {
    l.existing = await returnOrg({ org: req.body.organization, branch: req.body.branch });
    verifyRequest(req, l.existing);

    session.startTransaction();

    if (existing) {
      if (existing.admin?.some((a) => a.email === email || a.adminId === adminId)) {
        throw new Error('Admin already exists! Login with your ID and password');
      }

      await updateAdmin(existing.code, adm, 'pushAdmin', session);

      data = {
        type: 'success',
        org: l.existing.code,
        name: adm.name,
        role: 'admin',
        id: adm.adminId,
        email: adm.email,
        contact,
        message: 'Another admin added successfully!',
        approvalStatus: null,
      }

      await registerLog(data, session);
    }
    else {
      while (true) {
        l.code = generateCode(6, "numeric");
        l.exists = await returnOrg({ code: l.code });
        if (!l.exists) break;
      }

      const token = crypto.randomBytes(32).toString('hex');

      setup =
        req.body.type === 'corporate'
          ? { subjectsUploaded: true, scheduleUploaded: false, done: false }
          : { subjectsUploaded: false, scheduleUploaded: false, done: false };

      data = {
        org: req.body.organization,
        branch: req.body.branch,
        address: req.body.address,
        type: req.body.type,
        website: req.body.website,
        attendanceMethod: (type === 'corporate') ? null : req.body.attendanceMethod,
        agreement: true,
        setup: req.body.setup,
      }
      lowercased = lowercase(data);
      lowercased.admin = adm;


      const createdOrg = await createOrg(lowercased, session);

      data = {
        type: 'success',
        org: l.code,
        name: adm.name,
        id: adm.adminId,
        role: 'admin',
        email: adm.email,
        contact: adm.contact,
        message: 'admin registered successfully!',
        approvalStatus: null,
      }

      await registerLog(data, session);

      await sendVerificationEmail(adm.email, token, l.code, 'admin', null);

      await session.commitTransaction();
      session.endSession();

      const params = new URLSearchParams({
        "popup-type": 'success',
        "popup-message": 'All Set!! Verify your org! We have sent you a mail.',
      });

      return res.redirect(`/?${params}`);
    }
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    data = {
      type: 'failed',
      org: l.code ?? null,
      name: adm.name ?? null,
      id: adm.adminId ?? null,
      role: 'admin',
      email: adm.email ?? null,
      contact: adm.contact ?? null,
      message: err.message
    }

    await registerLog(data);

    const params = new URLSearchParams({
      "popup-type": "error",
      "popup-message": err.message || "Registration failed. Please try again.",
    });

    return res.redirect(`/?${params}`);
  }
};