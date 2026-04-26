const bcrypt = require("bcrypt");
const Org = require("../../models/users/organization");
const CollegeStudent = require("../../models/users/college-student");
const SchoolStudent = require("../../models/users/school-student");
const Employee = require("../../models/users/employee");
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

    try {
        if (!code || !userRole || !password) {
            return sendError(res, "All fields are required");
        }

        const org = await Org.findOne({
            code,
            isDeleted: false,
            isSuspended: false,
        });

        if (!org || org.verification.status !== "verified") {
            return sendError(res, "Invalid, suspended or unverified organization");
        }

        if (userRole === "Org") {
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

            await logLogin({
                type: "success",
                org: org.code,
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

        if (userRole === "School Student") {
            const student = await SchoolStudent.findOne({
                code,
                isDeleted: false,
                isSuspended: false,
            });

            if (!student || student.verification.status !== "verified") {
                return sendError(res, "Invalid or unverified student");
            }

            globalUser = student;

            const match = await bcrypt.compare(password, student.password);
            if (!match) {
                return sendError(res, "Invalid credentials");
            }

            await logLogin({
                type: "success",
                org: org.code,
                id: student.roll,
                name: student.name,
                role: "school-student",
                message: "Logged in successfully!",
            });

            req.session.user = {
                code: student.code,
                name: student.name,
                email: student.email,
                role: "school-student",
            };

            return res.redirect("/dashboard/school-student");
        }

        if (userRole === "College Student") {
            const student = await CollegeStudent.findOne({
                code,
                isDeleted: false,
                isSuspended: false,
            });

            if (!student || student.verification.status !== "verified") {
                return sendError(res, "Invalid or unverified student");
            }

            globalUser = student;

            const match = await bcrypt.compare(password, student.password);
            if (!match) {
                return sendError(res, "Invalid credentials");
            }

            await logLogin({
                type: "success",
                org: org.code,
                id: student.roll,
                name: student.name,
                role: "college-student",
                message: "Logged in successfully!",
            });

            req.session.user = {
                code: student.code,
                name: student.name,
                email: student.email,
                role: "college-student",
            };

            return res.redirect("/dashboard/college-student");
        }

        if (userRole === "Employee") {
            const employee = await Employee.findOne({
                code,
                isDeleted: false,
                isSuspended: false,
            });

            if (!employee || employee.verification.status !== "verified") {
                return sendError(res, "Invalid or unverified employee");
            }

            globalUser = employee;

            const match = await bcrypt.compare(password, employee.password);
            if (!match) {
                return sendError(res, "Invalid credentials");
            }

            await logLogin({
                type: "success",
                org: org.code,
                id: employee.employeeId || employee.code,
                name: employee.name,
                role: "employee",
                message: "Logged in successfully!",
            });

            req.session.user = {
                code: employee.code,
                name: employee.name,
                email: employee.email,
                role: "employee",
            };

            const orgData = await Org.findOne({ code: employee.org }).select("type");

            const employeeType =
                orgData && orgData.type === "corporate" ? "corporate" : "teacher";

            req.session.user.employeeType = employeeType;

            return res.redirect(
                employeeType === "corporate"
                    ? "/dashboard/employee/corporate"
                    : "/dashboard/employee/teacher"
            );
        }

        return sendError(res, "Invalid role selected");

    } catch (err) {
        console.error("Login Error:", err);

        await logLogin({
            type: "failed",
            org: code || "null",
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