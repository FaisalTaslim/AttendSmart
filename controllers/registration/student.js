const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Org = require("../../models/users/organization");
const CollegeStudent = require("../../models/users/college-student");
const SchoolStudent = require("../../models/users/school-student");
const Summary = require("../../models/statistics/student-summary");
const RegisterLog = require("../../models/logs/register");
const generateCode = require("../../utils/functions/generate-code");
const crypto = require("crypto");
const {
  sendVerificationEmail,
} = require("../../utils/emails/send-registration-emails");
const { getMonthKey } = require("../../utils/functions/time");
const verifyDomains = require("../../utils/emails/verify-domains");

class AppError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

const ERROR_MESSAGES = {
  MISSING_FIELDS: "Please fill in all required fields.",
  PASSWORD_MISMATCH: "Password mismatch!",
  INVALID_EMAIL_DOMAIN: "Use organization email only.",
  ACCOUNT_EXISTS: "Account already exists.",
  ORG_NOT_FOUND: "Organization not found.",
  NO_SUBJECTS: "Please select at least one subject.",
};

const FALLBACK_MESSAGE = "Registration failed. Please try again.";

async function createSummaries({
  attendanceType,
  org,
  code,
  name,
  department,
  subjects,
  month,
  session,
}) {
  if (attendanceType === "subject-wise") {
    const summaries = subjects.map((subject) => ({
      org,
      code,
      name,
      department,
      subject,
      month,
    }));

    await Summary.insertMany(summaries, { session });
  } else if (attendanceType === "one-time") {
    await Summary.create(
      [
        {
          org,
          code,
          name,
          department,
          subject: null,
          month,
        },
      ],
      { session },
    );
  }
}

exports.register_clg = async (req, res) => {
  const session = await mongoose.startSession();
  const month = getMonthKey();

  const { name, roll, dept, contact, email, org, password, confirmPassword } =
    req.body;
  const { majors = [], minors = [], optionals = [] } = req.body;

  let code = null;

  try {
    if (!name || !roll || !dept || !contact || !email || !org || !password) {
      throw new AppError("MISSING_FIELDS");
    }

    if (password !== confirmPassword) throw new AppError("PASSWORD_MISMATCH");
    if (!verifyDomains(email.toLowerCase())) {
      throw new AppError("INVALID_EMAIL_DOMAIN");
    }

    const subjects = [...majors, ...minors, ...optionals]
      .map((s) => s.trim())
      .filter(Boolean);

    if (subjects.length === 0) throw new AppError("NO_SUBJECTS");

    const orgDoc = await Org.findOne({ code: org });
    if (!orgDoc) throw new AppError("ORG_NOT_FOUND");

    session.startTransaction();

    const existing = await CollegeStudent.findOne(
      {
        org,
        name: name.toLowerCase().trim(),
        roll: roll.trim(),
        isDeleted: false,
      },
      null,
      { session },
    );

    if (existing) throw new AppError("ACCOUNT_EXISTS");

    const hashedPassword = await bcrypt.hash(password, 10);

    let codeExists = true;
    while (codeExists) {
      code = generateCode(6, "numeric");
      const check = await CollegeStudent.findOne({ code }).session(session);
      if (!check) codeExists = false;
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [student] = await CollegeStudent.create(
      [
        {
          org,
          code,
          name: name.toLowerCase().trim(),
          roll: roll.trim(),
          dept,
          contact,
          email: email.toLowerCase().trim(),
          subjects,
          verification: {
            status: "pending",
            token: verificationToken,
            expiresAt: tokenExpiry,
          },
          settings: {
            theme: "light",
          },
          password: hashedPassword,
          termsCheck: "accepted",
          setup: {
            faceUploaded: false,
          },
        },
      ],
      { session },
    );

    await createSummaries({
      attendanceType: orgDoc.attendanceMethod,
      org,
      code,
      name: student.name,
      department: dept,
      subjects,
      month,
      session,
    });

    await RegisterLog.create(
      [
        {
          type: "success",
          org,
          name: name.toLowerCase().trim(),
          id: roll.trim(),
          role: "student",
          email: email.toLowerCase().trim(),
          contact,
          message: "Student registered successfully!",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    await sendVerificationEmail(
      email.toLowerCase().trim(),
      verificationToken,
      code,
      "student",
      "college-student",
    );

    const params = new URLSearchParams({
      "popup-type": "warning",
      "popup-message": "Check your email!",
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
      id: roll?.trim() || null,
      role: student,
      email: email?.toLowerCase().trim() || null,
      contact: contact || null,
      message: err.message,
    });

    const message = ERROR_MESSAGES[err.code] || FALLBACK_MESSAGE;

    const params = new URLSearchParams({
      "popup-type": "error",
      "popup-message": message,
    });

    return res.redirect(`/?${params}`);
  }
};

exports.register_sch = async (req, res) => {
  const session = await mongoose.startSession();
  const month = getMonthKey();

  const {
    org,
    name,
    roll,
    standard,
    stream,
    contact,
    email,
    password,
    confirmPassword,
  } = req.body;
  const { majors = [], minors = [], optionals = [] } = req.body;

  let code = null;

  try {
    if (
      !org ||
      !name ||
      !roll ||
      !standard ||
      !stream ||
      !contact ||
      !email ||
      !password
    ) {
      throw new AppError("MISSING_FIELDS");
    }

    if (password !== confirmPassword) throw new AppError("PASSWORD_MISMATCH");
    if (!verifyDomains(email.toLowerCase())) {
      throw new AppError("INVALID_EMAIL_DOMAIN");
    }

    const subjects = [...majors, ...minors, ...optionals]
      .map((s) => s.trim())
      .filter(Boolean);

    if (subjects.length === 0) throw new AppError("NO_SUBJECTS");

    const orgDoc = await Org.findOne({ code: org });
    if (!orgDoc) throw new AppError("ORG_NOT_FOUND");

    session.startTransaction();

    const existing = await SchoolStudent.findOne(
      {
        org,
        name: name.toLowerCase().trim(),
        roll: roll.trim().toLowerCase(),
        standard: standard.trim(),
        isDeleted: false,
      },
      null,
      { session },
    );

    if (existing) throw new AppError("ACCOUNT_EXISTS");

    const hashedPassword = await bcrypt.hash(password, 10);

    let codeExists = true;
    while (codeExists) {
      code = generateCode(6, "numeric");
      const check = await SchoolStudent.findOne({ code }).session(session);
      if (!check) codeExists = false;
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [student] = await SchoolStudent.create(
      [
        {
          org,
          code,
          name: name.toLowerCase().trim(),
          roll: roll.trim().toLowerCase(),
          standard: standard.trim(),
          stream,
          contact,
          email: email.toLowerCase().trim(),
          subjects,
          verification: {
            status: "pending",
            token: verificationToken,
            expiresAt: tokenExpiry,
          },
          settings: {
            theme: "light",
          },
          setup: {
            faceUploaded: false,
          },
          password: hashedPassword,
          termsCheck: "accepted",
        },
      ],
      { session },
    );

    await createSummaries({
      attendanceType: orgDoc.attendanceMethod,
      org,
      code,
      name: student.name,
      department: standard,
      subjects,
      month,
      session,
    });

    await RegisterLog.create(
      [
        {
          type: "success",
          org,
          name: name.toLowerCase().trim(),
          id: roll.trim(),
          role: "student",
          email: email.toLowerCase().trim(),
          contact,
          message: "Student registered successfully!",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    await sendVerificationEmail(
      student.email,
      verificationToken,
      student.code,
      "student",
      "school-student",
    );

    const params = new URLSearchParams({
      "popup-type": "warning",
      "popup-message": "Check your email!",
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
      id: roll?.trim() || null,
      role: "student",
      email: email?.toLowerCase().trim() || null,
      contact: contact || null,
      message: err.message,
    });

    const message = ERROR_MESSAGES[err.code] || FALLBACK_MESSAGE;

    const params = new URLSearchParams({
      "popup-type": "error",
      "popup-message": message,
    });

    return res.redirect(`/?${params}`);
  }
};
