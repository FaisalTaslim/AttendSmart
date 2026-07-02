const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validateFields = require("../../utils/validate-form-fields");
const returnOrg = require('../../services/fetch/returnOrg');
const generateCode = require('../../utils/functions/generate-code');
const crypto = require('crypto');
const resolveUserModels = require('../../utils/functions/resolve-user-models');

const { createRegisterLog } = require('../../services/create/logs');
const { createOrg } = require('../../services/create/users');
const { updateAdmin } = require('../../services/update/users');
const { sendVerificationEmail, } = require('../../utils/emails/send-registration-emails');

exports.adm = async (req, res) => {
  const session = await mongoose.startSession();

  let code = null, data;
  const { admin, organization, branch, address, type, website, attendanceMethod, confirmPassword, termsCheck } = req.body;
  const adminData = admin?.[0];
  const { name, adminId, contact, email, password } = adminData;

  try {
    if (password !== confirmPassword) throw new Error('Password mismatch!');

    const hashedPassword = await bcrypt.hash(password, 12);

    const adm = {
      name: name.toLowerCase().trim(),
      adminId: adminId.toLowerCase().trim(),
      contact,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    }

    if (!validateFields(Object.values(req.body)) || !validateFields(Object.values(adminData)))
      throw new Error('Suspicious activity detected! Fill in all required fields!');

    session.startTransaction();

    const existing = await returnOrg({ code: organization, branch });

    if (existing) {
      if (admin?.some((a) => a.email === email || a.adminId === adminId)) {
        throw new Error('Admin already exists! Login with your ID and password');
      }
      else {
        await updateAdmin(existing.code, adm, 'pushAdmin', session);

        data = {
          type: 'success',
          org: existing.code,
          name: name,
          role: 'admin',
          id: adminId,
          email: email,
          contact,
          message: 'Another admin added successfully!',
          approvalStatus: null,
        }

        await createRegisterLog(data, session);
      }
    }
    else {
      while (true) {
        code = generateCode(6, "numeric");
        const exists = await returnOrg({ code });
        if (!exists) break;
      }

      const token = crypto.randomBytes(32).toString('hex');

      const setup =
        type === 'corporate'
          ? { subjectsUploaded: true, scheduleUploaded: false, done: false }
          : { subjectsUploaded: false, scheduleUploaded: false, done: false };

      data = {
        code,
        org: organization.toLowerCase().trim(),
        branch: branch.toLowerCase().trim(),
        type,
        address: address.toLowerCase().trim(),
        website,
        attendanceMethod: (type === 'corporate') ? null : attendanceMethod,
        agreement: true,
        adm,
        setup,
      }

      const createdOrg = await createOrg(data, session);

      data = {
        type: 'success',
        org: code,
        name,
        id: adminId,
        role: 'admin',
        email,
        contact,
        message: 'admin registered successfully!',
        approvalStatus: null,
      }

      await createRegisterLog(data, session);

      await sendVerificationEmail(email, token, code, 'admin', null);

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
      org: code ?? null,
      name: name ?? null,
      id: adminId ?? null,
      role: 'admin',
      email: email ?? null,
      contact,
      message: err.message
    }

    await createRegisterLog(data);

    const params = new URLSearchParams({
      "popup-type": "error",
      "popup-message": err.message || "Registration failed. Please try again.",
    });

    return res.redirect(`/?${params}`);
  }
};