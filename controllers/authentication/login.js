const bcrypt = require("bcrypt");
const Org = require("../../models/users/organization");
const resolveUserModel = require("../../utils/resolve-user-models");
const LoginLog = require("../../models/logs/login");

const logLogin = async ({ type, org, id, name, role, message }) => {
  try {
    await LoginLog.create({ type, org, id, name, role, message });
  } catch (err) {
    console.error("Log error:", err);
  }
};

const sendError = (res, message) =>
  res.render("index", { popupMessage: message, popupType: "error" });

const resolveUserId = (user) =>
  user?.adminId || user?.employeeId || user?.roll || user?.code || "null";

const loginAsAdmin = async (res, req, { code, password }) => {
  const org = await Org.findOne({ code, isDeleted: false, isSuspended: false });

  if (!org || org.verification.status !== "verified") {
    return { error: "Invalid or unverified organization" };
  }

  const results = await Promise.all(
    org.admin.map((admin) =>
      bcrypt
        .compare(password, admin.password)
        .then((match) => ({ match, admin })),
    ),
  );
  const found = results.find((r) => r.match);

  if (!found) {
    return { error: "Invalid credentials" };
  }

  return { user: found.admin, orgCode: org.code };
};

const loginAsUser = async (res, req, { code, userRole, password }) => {
  const Model = resolveUserModel(userRole);
  if (!Model) return { error: "Invalid role" };

  const user = await Model.findOne({
    code,
    isDeleted: false,
    isSuspended: false,
    "verification.status": "verified",
    approvalStatus: "approved",
  });

  if (!user) {
    return { error: "Invalid or unverified user" };
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { error: "Invalid credentials" };

  return { user, orgCode: user.org };
};

exports.login = async (req, res) => {
  const { code, userRole, password } = req.body;

  if (!code || !userRole || !password) {
    return sendError(res, "All fields are required");
  }

  let user = null;
  let orgCode = null;

  try {
    const result =
      userRole === "admin"
        ? await loginAsAdmin(res, req, { code, password })
        : await loginAsUser(res, req, { code, userRole, password });

    if (result.error) {
      return sendError(res, result.error);
    }

    ({ user, orgCode } = result);

    await logLogin({
      type: "success",
      org: orgCode,
      id: resolveUserId(user),
      name: user.name,
      role: userRole,
      message: "Logged in successfully!",
    });

    req.session.user = {
      code: userRole === "admin" ? code : user.code,
      name: user.name,
      email: user.email,
      role: userRole,
    };

    if (userRole === "employee") {
      const orgData = await Org.findOne({ code: orgCode }).select("type");
      req.session.user.employeeType =
        orgData?.type === "corporate" ? "corporate" : "teacher";
    }

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return sendError(res, "Something went wrong during login");
      }

      return res.redirect("/dashboard");
    });
  } catch (err) {
    console.error("Login Error:", err);

    await logLogin({
      type: "failed",
      org: orgCode || "null",
      id: resolveUserId(user),
      name: user?.name || "null",
      role: userRole || "null",
      message: err.message || "Login failed",
    });

    return sendError(res, "Something went wrong during login");
  }
};
