const bcrypt = require("bcrypt");
const Org = require("../../models/users/organization");
const CollegeStudent = require("../../models/users/college-student");
const SchoolStudent = require("../../models/users/school-student");
const Employee = require('../../models/users/employee');
const OrgLog = require("../../models/statistics/logs");

exports.login = async (req, res) => {
    try {
        const { code, userRole, password } = req.body;

        if (!code || !userRole || !password) {
            return res.render("index", {
                popupMessage: "All fields are required",
                popupType: "error",
            });
        }

        if (userRole === "Org") {
            const org = await Org.findOne({
                code,
                isDeleted: false,
                isSuspended: false
            });

            if (!org || org.verification.status !== "verified") {
                return res.render("index", {
                    popupMessage: "Invalid or unverified organization",
                    popupType: "error",
                });
            }

            const admin = org.admin[0];
            const match = await bcrypt.compare(password, admin.password);
            if (!match) {
                return res.render("index", {
                    popupMessage: "Invalid credentials",
                    popupType: "error",
                });
            }

            await OrgLog.findOneAndUpdate(
                { org: org.code },
                {
                    $push: {
                        loginLogs: {
                            userId: admin.adminId,
                            name: admin.name,
                            role: "admin",
                            createdAt: new Date()
                        }
                    }
                },
                { upsert: true }
            );

            req.session.user = {
                code: org.code,
                name: admin.name,
                email: admin.email,
                role: "admin"
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
                return res.render("index", {
                    popupMessage: "Invalid or unverified student",
                    popupType: "error",
                });
            }

            const match = await bcrypt.compare(password, student.password);
            if (!match) {
                return res.render("index", {
                    popupMessage: "Invalid credentials",
                    popupType: "error",
                });
            }

            await OrgLog.findOneAndUpdate(
                { org: student.org },
                {
                    $push: {
                        loginLogs: {
                            userId: student.code,
                            name: student.name,
                            role: "student",
                            createdAt: new Date()
                        }
                    }
                },
                { upsert: true }
            );

            req.session.user = {
                code: student.code,
                name: student.name,
                email: student.email,
                role: "school-student"
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
                return res.render("index", {
                    popupMessage: "Invalid or unverified student",
                    popupType: "error",
                });
            }

            const match = await bcrypt.compare(password, student.password);
            if (!match) {
                return res.render("index", {
                    popupMessage: "Invalid credentials",
                    popupType: "error",
                });
            }

            await OrgLog.findOneAndUpdate(
                { org: student.org },
                {
                    $push: {
                        loginLogs: {
                            userId: student.code,
                            name: student.name,
                            role: "student",
                            createdAt: new Date()
                        }
                    }
                },
                { upsert: true }
            );

            req.session.user = {
                code: student.code,
                name: student.name,
                email: student.email,
                role: "college-student"
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
                return res.render("index", {
                    popupMessage: "Invalid or unverified employee",
                    popupType: "error",
                });
            }

            const match = await bcrypt.compare(password, employee.password);
            if (!match) {
                return res.render("index", {
                    popupMessage: "Invalid credentials",
                    popupType: "error",
                });
            }

            await OrgLog.findOneAndUpdate(
                { org: employee.org },
                {
                    $push: {
                        loginLogs: {
                            userId: employee.code,
                            name: employee.name,
                            role: "employee",
                            createdAt: new Date()
                        }
                    }
                },
                { upsert: true }
            );

            req.session.user = {
                code: employee.code,
                name: employee.name,
                email: employee.email,
                role: "employee"
            };

            const org = await Org.findOne({
                code: employee.org,
                isDeleted: false,
                isSuspended: false,
            }).select("type");

            const employeeType = (org && org.type === "corporate") ? "corporate" : "teacher";
            req.session.user.employeeType = employeeType;

            if (employeeType === "corporate") {
                return res.redirect("/dashboard/employee/corporate");
            }

            return res.redirect("/dashboard/employee/teacher");
        }

    } catch (err) {
        console.error("Login error:", err);
        return res.render("index", {
            popupMessage: "Something went wrong during login",
            popupType: "error",
        });
    }
};
