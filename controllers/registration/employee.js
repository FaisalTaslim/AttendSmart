const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const validateFields = require("../../utils/validate-fields");
const { returnOrg, returnEmployee } = require('../../services/fetch/users');

const Employee = require("../../models/users/employee");
const EmployeeSummary = require("../../models/statistics/employee-summary");
const RegisterLog = require("../../models/logs/register");
const generateCode = require("../../utils/generate-code");
const crypto = require("crypto");
const {
  sendVerificationEmail,
} = require("../../services/emails/send-registration-emails");
const { getMonthKey } = require("../../utils/time");


exports.register_emp = async (req, res) => {
  const session = await mongoose.startSession();
  const month = getMonthKey();

  while (true) {
    code = generateCode(6, "numeric");
    const exists = await returnEmployee({ code });
    if (!exists) break;
  }
  
  let code;
  const orgDoc = await returnOrg({ code: org });
  const existingEmployee = await returnEmployee({ code });

  const { org, name, employeeId, designation, workPlace, shift, contact, email, password, confirmPassword } = req.body;

  try {
    if ((!validateFields(Object.values(req.body)) || !validateFields({orgDoc}) && (password !== confirmPassword)))
      throw new Error('Incorrect Password or missing fields! Try agian later!');

    session.startTransaction();


    if (existingEmployee) {
      throw new Error("ACCOUNT_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
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
          code,
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
      code: code || null,
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