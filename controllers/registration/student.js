const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoose = require("mongoose");

const { getMonthKey } = require("../../utils/time");
const validateFields = require("../../utils/validate-fields");
const generateCode = require("../../utils/generate-code");

const { returnStudent } = require("../../services/fetch/users");
const { createStudent } = require("../../services/create/users");
const { registerLog } = require("../../services/create/logs");
const { createStudentSummary } = require("../../services/create/summary");
const {
  sendVerificationEmail,
} = require("../../services/emails/send-registration-emails");

function verifyRequest(req) {
  const verify = {
    invalidFields: validateFields(Object.values(req.body)),
    passwordMatches: req.body.password === req.body.confirmPassword,
  };

  if (!Object.values(verify).every(Boolean)) {
    throw new Error("Incorrect password or missing fields!");
  }
}

async function processData(req, type) {
  let body = req.body,
    user,
    summary,
    code,
    exists;
  const subjects = (subjects = [...majors, ...minors, ...optionals]
    .map((s) => s.trim())
    .filter(Boolean));

  const {
    org,
    name,
    roll,
    contact,
    email,
    password,
    majors = [],
    minors = [],
    optionals = [],
  } = body;

  let dept, standard, stream;

  if (type === "college-student") {
    ({ dept } = body);
  } else {
    ({ standard, stream } = body);
  }

  while (true) {
    code = generateCode(6, "numeric");
    exists = await returnStudent({ code }, type);
    if (!exists) break;
  }

  user = {
    org,
    name: name.toLowerCase().trim(),
    code,
    roll,
    contact,
    email: email.toLowerCase().trim(),
    password: await bcrypt.hash(password, 10),
    verification: {
      status: "pending",
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    setup: {
      faceUploaded: false,
    },
  };

  if (type === "college-student") user.dept = dept?.toLowerCase()?.trim();
  else {
    user.standard = standard?.toLowerCase()?.trim();
    user.stream = stream?.toLowerCase()?.trim();
  }

  if (subjects.length === 0) throw new Error("NO_SUBJECTS");

  summary = {
    org,
    code: user.code,
    name: user.name,
    subject: type === "college-student" ? subjects : null,
    department: type === "college-student" ? user.dept : user.standard,
    month: getMonthKey(),
  };

  return { user, summary };
}

exports.request = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let state = { role: null };
  let data;
  let object = { log: null, params: null, search: null };

  try {
    verifyRequest(req);
    state.role =
      req.body.dept !== undefined ? "college-student" : "school-student";

    data = await processData(req, state.role);

    object.search = {
      org: data.user.org,
      name: data.user.name,
      roll: data.user.roll,
    };

    if (state.role === "college-student") object.search.dept = data.user.dept;
    else object.search.standard = data.user.standard;

    if (await returnStudent(object.search, state.role))
      throw new Error("Account exists! Login to your account!");

    await createStudent(data.user, state.role, session);
    await createStudentSummary(data.summary, session);

    object.log = {
      type: "success",
      org: data.user.org,
      code: data.user.code,
      name: data.user.name,
      id: data.user.roll,
      role: state.role,
      email: data.user.email,
      contact: data.user.contact,
      message: "Successful!!",
    };

    await registerLog(object.log, session);

    await session.commitTransaction();
    await sendVerificationEmail(
      data.user.email,
      data.user.verification.token,
      data.user.code,
      "student",
      state.role,
    );

    object.params = new URLSearchParams({
      "popup-type": "warning",
      "popup-message": "Check your email to verify your account!",
    });

    return res.redirect(`/app?${params}`);
    
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    object.log = {
      type: "failed",
      org: data?.user.org ?? null,
      code: data?.user.code ?? null,
      name: data?.user.name ?? null,
      id: data?.user.roll ?? null,
      role: state.role ?? null,
      email: data?.user.email ?? null,
      contact: data?.user.contact ?? null,
      message: err.message,
    };
    await registerLog(object.log, session);

    object.params = new URLSearchParams({
      "popup-type": "error",
      "popup-message": err.message || "Registration failed. Please try again.",
    });

    return res.redirect(`/app?${params}`);
    
  } finally {
    await session.endSession();
  }
};
