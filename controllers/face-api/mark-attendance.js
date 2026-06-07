const mongoose = require("mongoose");
const resolveUserModel = require("../../utils/functions/resolve-user-models");
const Employee = require("../../models/users/employee");
const SchoolStudent = require("../../models/users/school-student");
const CollegeStudent = require("../../models/users/college-student");
const EmployeeSummary = require("../../models/statistics/employee-summary");
const StudentSummary = require("../../models/statistics/student-summary");
const EmployeeHistory = require("../../models/logs/employee-attendance-history");
const StudentHistory = require("../../models/logs/student-attendance-history");
const activeEmployeeSession = require("../../models/attendance/active-employee-session");
const activeStudentSession = require("../../models/attendance/active-student-session");
const Schedule = require("../../models/schedule/schedule");
const {
    fullTime,
    fullweek,
    timeToMinutes,
    getMonthKey,
} = require("../../utils/functions/time");


function recalculatePercentage(summaryDoc) {
    if (!summaryDoc.total) {
        summaryDoc.percentage = 0;
        return;
    }

    summaryDoc.percentage = Number(
        ((summaryDoc.attended / summaryDoc.total) * 100).toFixed(2),
    );
}

async function getCurrentUser(req) {
    const userModel = resolveUserModel(req.session?.user?.role);

    if (!userModel) {
        return null;
    }

    return await userModel.findOne({ code: req.session.user.code });
}

function resolveStudentModel(type, sessionRole) {
    if (type === "college-student" || sessionRole === "college-student") {
        return CollegeStudent;
    }

    return SchoolStudent;
}

exports.markAttendance = async (req, res) => {
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    console.log("MARK ATTENDANCE HIT");

    const fail = async (status, message) => {
        await dbSession.abortTransaction().catch(() => {});
        return res.status(status).json({
            success: false,
            message,
        });
    };

    try {
        const currentUser = await getCurrentUser(req);

        if (!currentUser) {
            return fail(401, "Unauthorized");
        }

        const org = req.session.user.code;
        const requestedKind = req.query.user || req.body.isUser;
        const sessionCode = req.body.sessionCode;
        const userCode = req.body.userCode;
        const requestedType = req.body.type || req.query.type;
        const dept = (req.body.dept || req.query.dept || "").trim();
        const subject = req.body.subject ?? null;

        if (!sessionCode || !userCode || !requestedKind) {
            return fail(400, "Missing attendance payload");
        }

        if (requestedKind === "employee") {
            const sessionDoc = await activeEmployeeSession.findOne({
                org,
                sessionCode,
            });
            console.log("printing the session doc");
            console.log(org);
            console.log(sessionCode);
            console.log(sessionDoc);

            if (!sessionDoc) {
                return fail(404, "Active employee session not found");
            }

            const employee = await Employee.findOne({
                org,
                code: userCode,
                isDeleted: false,
                isSuspended: false,
            }).session(dbSession);

            if (!employee) {
                return fail(404, "Employee not found");
            }

            const historyDoc = await EmployeeHistory.findOne({
                org,
                sessionCode,
            }).session(dbSession);

            if (!historyDoc) {
                return fail(404, "Attendance log not found");
            }

            const currentType = sessionDoc.type || requestedType || "check-in";
            const entryIndex = historyDoc.history.findIndex(
                (entry) => entry.code === userCode && !entry.checkOut,
            );

            if (currentType === "check-in") {
                const schedule = await Schedule.findOne({ org }).session(dbSession);

                if (!schedule) {
                    return fail(404, "Schedule not found");
                }

                const today = fullweek();
                const shiftType = sessionDoc.shift;
                const shiftSchedule = schedule.week?.[today]?.[shiftType];

                if (!shiftSchedule) {
                    return fail(404, "Shift schedule not found");
                }

                const { hours, minutes } = fullTime();
                const currentMinutes = timeToMinutes(hours, minutes);
                const [checkInHour, checkInMinute] = shiftSchedule.check_in
                    .split(":")
                    .map(Number);
                const checkInMinutes = timeToMinutes(checkInHour, checkInMinute);
                const grace = schedule.grace || 0;
                const isLate = currentMinutes >= checkInMinutes + grace;

                historyDoc.history.push({
                    code: employee.code,
                    name: employee.name,
                    status: isLate ? "late" : "on-time",
                    checkIn: new Date(),
                    checkOut: null,
                });

                await historyDoc.save({ session: dbSession });

                await dbSession.commitTransaction();
                return res.json({
                    success: true,
                    message: "Employee check-in marked successfully",
                });
            }

            if (entryIndex === -1) {
                return fail(
                    400,
                    "attendance marking failed, because user didn't check-in first",
                );
            }

            historyDoc.history[entryIndex].checkOut = new Date();
            await historyDoc.save({ session: dbSession });

            const month = getMonthKey();
            const summaryDoc = await EmployeeSummary.findOne({
                org,
                code: employee.code,
                department: employee.designation,
                shift: sessionDoc.shift,
                month,
            }).session(dbSession);

            if (!summaryDoc) {
                return fail(404, "Employee summary not found");
            }

            summaryDoc.attended += 1;
            recalculatePercentage(summaryDoc);
            await summaryDoc.save({ session: dbSession });

            await dbSession.commitTransaction();
            return res.json({
                success: true,
                message: "Employee check-out marked successfully",
            });
        }

        const sessionDoc = await activeStudentSession.findOne({
            org,
            sessionCode,
        });

        if (!sessionDoc) {
            return fail(404, "Active student session not found");
        }

        const StudentModel = resolveStudentModel(
            requestedType,
            req.session.user.role,
        );

        const student = await StudentModel.findOne({
            org,
            code: userCode,
            isDeleted: false,
            isSuspended: false,
        }).session(dbSession);

        if (!student) {
            return fail(404, "Student not found");
        }

        const joinedEntry = sessionDoc.joined.find(
            (entry) => entry.code === userCode,
        );

        if (!joinedEntry) {
            return fail(
                400,
                "attendance marking failed, because user didn't join first",
            );
        }

        if (joinedEntry.attendanceMarked) {
            return fail(400, "Attendance already marked");
        }

        const historyDoc = await StudentHistory.findOne({
            org,
            sessionCode,
        }).session(dbSession);

        if (!historyDoc) {
            return fail(404, "Attendance log not found");
        }

        const subjectForSummary =
            requestedType === "college-student" || req.session.user.role === "college-student"
                ? subject || null
                : null;

        const departmentForSummary =
            dept ||
            student.dept ||
            student.standard ||
            sessionDoc.department ||
            null;

        const month = getMonthKey();
        const summaryDoc = await StudentSummary.findOne({
            org,
            code: student.code,
            department: departmentForSummary,
            subject: subjectForSummary,
            month,
        }).session(dbSession);

        if (!summaryDoc) {
            return fail(404, "Student summary not found");
        }

        summaryDoc.attended += 1;
        recalculatePercentage(summaryDoc);

        joinedEntry.attendanceMarked = true;
        joinedEntry.attendanceMarkedAt = new Date();

        const historyEntry = historyDoc.history.find(
            (entry) => entry.code === userCode && !entry.isMarked,
        );

        if (!historyEntry) {
            return fail(400, "Attendance history entry not found");
        }

        historyEntry.isMarked = true;

        await Promise.all([
            summaryDoc.save({ session: dbSession }),
            historyDoc.save({ session: dbSession }),
            sessionDoc.save({ session: dbSession }),
        ]);

        await dbSession.commitTransaction();

        return res.json({
            success: true,
            message: "Student attendance marked successfully",
        });
    } catch (err) {
        await dbSession.abortTransaction();

        console.error("Attendance mark failed:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Attendance marking failed",
        });
    } finally {
        dbSession.endSession();
    }
};
