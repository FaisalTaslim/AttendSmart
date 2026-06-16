const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Org = require("../../models/users/organization");
const Employee = require("../../models/users/employee");
const EmployeeSummary = require("../../models/statistics/employee-summary");
const RegisterLog = require("../../models/logs/register");
const generateCode = require("../../utils/functions/generate-code");
const crypto = require("crypto");
const {
  sendVerificationEmail,
} = require("../../utils/emails/send-registration-emails");
const verifyDomains = require("../../utils/emails/verify-domains");
const { getMonthKey } = require("../../utils/functions/time");

exports.register_emp = async (req, res) => {
  const session = await mongoose.startSession();
  const month = getMonthKey();
  let code = null;

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
    confirmPassword,
  } = req.body;

  try {
    if (
      !org ||
      !name ||
      !employeeId ||
      !designation ||
      !workPlace ||
      !shift ||
      !contact ||
      !email ||
      !password
    ) {
      throw new Error("MISSING_FIELDS");
    }

    if (password !== confirmPassword || !verifyDomains(email.toLowerCase())) {
      throw new Error("SUSPICIOUS_ACTIVITY");
    }

    const orgDoc = await Org.findOne({ code: org });
    if (!orgDoc) {
      throw new Error("ORG_NOT_FOUND");
    }

    session.startTransaction();

    const existingEmployee = await Employee.findOne({
      org,
      name: name.toLowerCase().trim(),
      employeeId: employeeId.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      isDeleted: false,
    }).session(session);

    if (existingEmployee) {
      throw new Error("ACCOUNT_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let codeExists = true;
    while (codeExists) {
      code = generateCode(6, "numeric");
      const check = await Employee.findOne({ code }).session(session);
      if (!check) codeExists = false;
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [employee] = await Employee.create(
      [
        {
          org,
          code,
          name: name.toLowerCase().trim(),
          employeeId: employeeId.toLowerCase().trim(),
          designation: designation.toLowerCase().trim(),
          workPlace,
          shift,
          contact,
          email: email.toLowerCase().trim(),
          verification: {
            status: "pending",
            token: verificationToken,
            expiresAt: tokenExpiry,
          },
          setup: {
            faceUploaded: false,
          },
          settings: {
            theme: "light",
          },
          password: hashedPassword,
          termsCheck: "accepted",
        },
      ],
      { session },
    );

    await EmployeeSummary.create(
      [
        {
          org,
          code,
          name: name.toLowerCase().trim(),
          department: designation.toLowerCase().trim(),
          shift,
          month,
        },
      ],
      { session },
    );

    await RegisterLog.create(
      [
        {
          type: "success",
          org,
          name: name.toLowerCase().trim(),
          id: employeeId.toLowerCase().trim(),
          role: "employee",
          email: email.toLowerCase().trim(),
          contact,
          message: "Employee registered successfully!",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    await sendVerificationEmail(
      email.toLowerCase().trim(),
      verificationToken,
      employee.code,
      "employee",
      null,
    );

    const params = new URLSearchParams({
      "popup-type": "warning",
      "popup-message": "Check your email to verify your account!",
    });

    return res.redirect(`/?${params}`);
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    await RegisterLog.create({
      type: "failed",
      org: org || null,
      name: name?.toLowerCase().trim() || null,
      id: employeeId?.toLowerCase().trim() || null,
      role: "employee",
      email: email?.toLowerCase().trim() || null,
      contact: contact || null,
      message: err.message,
    });

    const ERROR_MESSAGES = {
      MISSING_FIELDS: "Please fill in all required fields.",
      SUSPICIOUS_ACTIVITY: "Suspicious activity detected! Failed to register.",
      ORG_NOT_FOUND: "Invalid organization code.",
      ACCOUNT_EXISTS: "Employee already registered",
    };

    const message =
      ERROR_MESSAGES[err.message] || "Registration failed. Please try again.";
      
    const params = new URLSearchParams({
      "popup-type": "error",
      "popup-message": message,
    });

    return res.redirect(`/?${params}`);
  }
};