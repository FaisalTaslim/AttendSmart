const bcrypt = require("bcrypt");
const Org = require("../../models/users/organization");
const RegisterLog = require("../../models/logs/register");
const generateCode = require("../../utils/functions/generate-code");
const crypto = require("crypto");
const {
  sendVerificationEmail,
} = require("../../utils/emails/send-registration-emails");
const verifyDomains = require("../../utils/emails/verify-domains");
const mongoose = require("mongoose");
const resolveUserModels = require("../../utils/functions/resolve-user-models");

exports.adm = async (req, res) => {
  const session = await mongoose.startSession();
  let code = null;
  let name, adminId, contact, email;

  try {
    const {
      admin,
      organization,
      branch,
      address,
      type,
      website,
      attendanceMethod,
      confirmPassword,
      termsCheck,
    } = req.body;

    const adminData = admin?.[0];

    if (!adminData) throw new Error("Missing admin details.");

    ({ name, adminId, contact, email } = adminData);
    const { password } = adminData;

    if (!termsCheck || !password ||password !== confirmPassword ||!name ||!adminId ||!contact ||!email ||!organization ||!branch ||!type) {
      throw new Error("Suspicious behavior detected! Missing required fields!");
    }

    if (!verifyDomains(email)) {
      throw new Error("Please use your organization domain to register.");
    }

    session.startTransaction();

    const hashedPassword = await bcrypt.hash(password, 12);
    const existingOrg = await Org.findOne({ org: organization }).session(
      session,
    );

    let successMessage;

    if (existingOrg) {
      const adminExists = existingOrg.admin?.some(
        (existing) => existing.email === email || existing.adminId === adminId,
      );

      if (adminExists) {
        throw new Error("Admin already exists for this organization.");
      }

      await Org.findOneAndUpdate(
        { _id: existingOrg._id },
        {
          $push: {
            admin: {
              name: name.toLowerCase().trim(),
              adminId: adminId.toLowerCase().trim(),
              contact,
              email: email.toLowerCase().trim(),
              password: hashedPassword,
            },
          },
        },
        { session },
      );

      await RegisterLog.findOneAndUpdate(
        { org: existingOrg.code },
        {
          $push: {
            register: {
              type: "success",
              org: existingOrg.code,
              name: name.toLowerCase().trim(),
              role: "admin",
              id: adminId.toLowerCase().trim(),
              email: email.toLowerCase().trim(),
              contact,
              message: "Another admin added successfully!",
              approvalStatus: null,
            },
          },
        },
        { upsert: true, session },
      );

      successMessage =
        "Admin already exists. Added another admin successfully!";
    } else {
      let codeExists = true;

      while (codeExists) {
        code = generateCode(6, "numeric");
        const check = await Org.findOne({ code }).session(session);
        if (!check) codeExists = false;
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const setup =
        type === "corporate"
          ? { subjectsUploaded: true, scheduleUploaded: false, done: false }
          : { subjectsUploaded: false, scheduleUploaded: false, done: false };

      await Org.create(
        [
          {
            code,
            org: organization,
            branch: branch.toLowerCase().trim(),
            type,
            address,
            website,
            attendanceMethod: null,
            agreement: true,
            admin: [
              {
                name: name.toLowerCase().trim(),
                adminId: adminId.toLowerCase().trim(),
                contact,
                email: email.toLowerCase().trim(),
                password: hashedPassword,
              },
            ],
            settings: { theme: "light" },
            verification: { status: "pending", token, expiresAt },
            setup,
          },
        ],
        { session },
      );

      await RegisterLog.create(
        [
          {
            type: "success",
            org: code,
            name: name.toLowerCase().trim(),
            id: adminId.toLowerCase().trim(),
            role: "admin",
            email: email.toLowerCase().trim(),
            contact,
            message: "Admin Registered successfully!",
          },
        ],
        { session },
      );

      await sendVerificationEmail(
        email.toLowerCase().trim(),
        token,
        code,
        "admin",
        null,
      );

      successMessage =
        "Registration Successful! Please check your email to verify your account.";
    }

    await session.commitTransaction();
    session.endSession();

    const params = new URLSearchParams({
      "popup-type": "success",
      "popup-message": successMessage,
    });

    return res.redirect(`/?${params}`);
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    await RegisterLog.create({
      type: "failed",
      org: code || "null",
      name: name?.toLowerCase().trim() || "null",
      id: adminId?.toLowerCase().trim() || "null",
      role: "admin",
      email: email?.toLowerCase().trim() || "null",
      contact: contact || "null",
      message: err.message,
    });

    const params = new URLSearchParams({
      "popup-type": "error",
      "popup-message": err.message || "Registration failed. Please try again.",
    });

    return res.redirect(`/?${params}`);
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { code: userCode, role: userRole } = req.query;
    const adminCode = req.session.user.code;
    const admin = await Org.findOne({ code: adminCode });

    if (!admin) {
      const params = new URLSearchParams({
        "popup-type": "error",
        "popup-message": "Error: Organization not found!",
      });
      return res.redirect(`/dashboard/admin?${params}`);
    }

    let Model;

    switch (userRole) {
      case "employee":
        Model = resolveUserModels("employee");
        break;

      case "student":
        if (admin.type === "college") {
          Model = resolveUserModels("college-student");
        } else if (admin.type === "school") {
          Model = resolveUserModels("school-student");
        } else {
          const params = new URLSearchParams({
            "popup-type": "error",
            "popup-message": "Error: Invalid Organization Type!",
          });
          return res.redirect(`/dashboard/admin?${params}`);
        }
        break;

      default: {
        const params = new URLSearchParams({
          "popup-type": "error",
          "popup-message": "Error: Invalid User Role!",
        });
        return res.redirect(`/dashboard/admin?${params}`);
      }
    }

    const updatedUser = await Model.findOneAndUpdate(
      { org: adminCode, code: userCode },
      { approvalStatus: "approved" },
      { new: true },
    );

    if (!updatedUser) {
      const params = new URLSearchParams({
        "popup-type": "error",
        "popup-message": "Error: Invalid User!",
      });
      return res.redirect(`/dashboard/admin?${params}`);
    }

    const params = new URLSearchParams({
      "popup-type": "success",
      "popup-message": "User approved successfully",
    });

    return res.redirect(`/dashboard/admin?${params}`);
  } catch (err) {
    console.error(err);

    const params = new URLSearchParams({
      "popup-type": "error",
      "popup-message": "Error: Internal Server Error!",
    });

    return res.redirect(`/dashboard/admin?${params}`);
  }
};
