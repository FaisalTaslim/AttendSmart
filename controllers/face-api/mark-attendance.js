const mongoose = require("mongoose");
const resolveUserModel = require("../../utils/functions/resolve-user-models");
const Employee = require("../../models/users/employee");
const SchoolStudent = require("../../models/users/school-student");
const CollegeStudent = require("../../models/users/college-student");
const EmployeeSummary = require("../../models/statistics/employee-summary");
const StudentSummary = require("../../models/statistics/student-summary");
const EmployeeHistory = require("../../models/logs/employee-attendance-history");
const StudentHistory = require("../../models/logs/student-attendance-history");
const Schedule = require("../../models/schedule/schedule");
const {
  fullTime,
  fullweek,
  timeToMinutes,
  getMonthKey,
} = require("../../utils/functions/time");

exports.markAttendance = async (req, res) => {
  const dbSession = await mongoose.startSession();
  try {
    dbSession.startTransaction();

    const { sessionCode, type, isUser, userCode, dept, subject, key } =
      req.body;
    const org = req.session.user.code;

    if (!sessionCode || !type || !isUser || !userCode) {
      await dbSession.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (isUser === "employee") {
      const userName = (
        await Employee.findOne({ code: userCode }).session(dbSession)
      )?.name;
      const today = fullTime();
      const shiftType = today.hours >= 6 && today.hours < 18 ? "day" : "night";
      const schedule = await Schedule.findOne({ org }).session(dbSession);
      const week = fullweek();

      const shiftSchedule = schedule.week?.[week]?.[shiftType];
      const grace = schedule.grace || 0;

      const currentMinutes = timeToMinutes(today.hours, today.minutes);
      const startMinutes = timeToMinutes(
        shiftSchedule.check_in.split(":")[0],
        shiftSchedule.check_in.split(":")[1],
      );

      if (type === "check-in") {
        await EmployeeHistory.findOneAndUpdate(
          { org: org, sessionCode: sessionCode },
          {
            $push: {
              history: {
                code: userCode,
                name: userName,
                checkIn: today.now,
                checkOut: null,
                status:
                  currentMinutes > startMinutes + grace ? "late" : "on-time",
              },
            },
          },
        ).session(dbSession);
      } else if (type === "check-out") {
        const history = await EmployeeHistory.findOne({
          org,
          sessionCode,
        }).session(dbSession);

        const index = history.history.findIndex((h) => h.code === userCode);

        if (index === -1) {
          await dbSession.abortTransaction();
          return res.status(400).json({
            success: false,
            message: "User didn't check-in earlier.",
          });
        }

        await EmployeeHistory.findOneAndUpdate(
          { org, sessionCode },
          {
            $set: {
              [`history.${index}.checkOut`]: today.now,
            },
          },
        ).session(dbSession);
      }
    } else {
      const userModel = resolveUserModel(type);
      const user = await userModel
        .findOne({ code: userCode })
        .session(dbSession);

      await StudentHistory.findOneAndUpdate(
        { org, sessionCode, subject, department: dept },
        {
          $push: {
            history: {
              code: userCode,
              sessionKey: key,
              name: user.name,
              date: fullTime()?.now,
              isMarked: true,
            },
          },
        },
      ).session(dbSession);

      await StudentSummary.findOneAndUpdate(
        {
          org,
          code: userCode,
          department: dept,
          subject,
          month: getMonthKey(),
        },
        {
          $inc: {
            attended: 1,
          },
        },
      ).session(dbSession);
    }

    await dbSession.commitTransaction();
    return res.json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (err) {
    await dbSession.abortTransaction();
    console.error("Attendance marking failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Attendance marking failed",
    });
  } finally {
    await dbSession.endSession();
  }
};
