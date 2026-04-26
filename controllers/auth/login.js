const bcrypt = require("bcrypt");
const Org = require("../../models/users/organization");
const resolveUserModel = require("../../utils/functions/resolveUserModel");
const LoginLog = require("../../models/logs/login");

const logLogin = async ({ type, org, id, name, role, message }) => {
    try {
        await LoginLog.create({ type, org, id, name, role, message });
    } catch (err) {
        console.error("Log error:", err);
    }
};

const sendError = (res, message) => {
    return res.render("index", {
        popupMessage: message,
        popupType: "error",
    });
};

exports.login = async (req, res) => {
    const { code, userRole, password } = req.body;

    let globalUser = null;
    let globalOrgCode = null;

    try {
        if (!code || !userRole || !password) {
            return sendError(res, "All fields are required");
        }

        if (userRole === "admin") {
            const org = await Org.findOne({
                code,
                isDeleted: false,
                isSuspended: false,
            });

            if (!org || org.verification.status !== "verified") {
                return sendError(res, "Invalid or unverified organization");
            }

            let matchedAdmin = null;

            for (const admin of org.admin) {
                const match = await bcrypt.compare(password, admin.password);
                if (match) {
                    matchedAdmin = admin;
                    break;
                }
            }

            if (!matchedAdmin) {
                return sendError(res, "Invalid credentials");
            }

            globalUser = matchedAdmin;
            globalOrgCode = org.code;

            await logLogin({
                type: "success",
                org: globalOrgCode,
                id: matchedAdmin.adminId,
                name: matchedAdmin.name,
                role: "admin",
                message: "Logged in successfully!",
            });

            req.session.user = {
                code: org.code,
                name: matchedAdmin.name,
                email: matchedAdmin.email,
                role: "admin",
            };

            return res.redirect("/dashboard/admin");
        }

        const Model = resolveUserModel(userRole);

        if (!Model) {
            return sendError(res, "Invalid role");
        }

        const user = await Model.findOne({
            code,
            isDeleted: false,
            isSuspended: false,
        });

        if (!user || user.verification.status !== "verified") {
            return sendError(res, "Invalid or unverified user");
        }

        globalUser = user;
        globalOrgCode = user.org;

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return sendError(res, "Invalid credentials");
        }

        await logLogin({
            type: "success",
            org: globalOrgCode,
            id: user.employeeId || user.roll || user.code,
            name: user.name,
            role: userRole,
            message: "Logged in successfully!",
        });

        req.session.user = {
            code: user.code,
            name: user.name,
            email: user.email,
            role: userRole,
        };


        if (userRole === "employee") {
            const orgData = await Org.findOne({ code: user.org }).select("type");

            const employeeType =
                orgData?.type === "corporate" ? "corporate" : "teacher";

            req.session.user.employeeType = employeeType;

            return res.redirect(
                employeeType === "corporate"
                    ? "/dashboard/employee/corporate"
                    : "/dashboard/employee/teacher"
            );
        }

        return res.redirect(`/dashboard/${userRole}`);

    } catch (err) {
        console.error("Login Error:", err);

        await logLogin({
            type: "failed",
            org: globalOrgCode || "null",
            id:
                globalUser?.adminId ||
                globalUser?.employeeId ||
                globalUser?.roll ||
                "null",
            name: globalUser?.name || "null",
            role: userRole || "null",
            message: err.message || "Login failed",
        });

        return sendError(res, "Something went wrong during login");
    }
};