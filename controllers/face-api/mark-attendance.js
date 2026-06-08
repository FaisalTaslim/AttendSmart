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
  try {
    const { sessionCode, type, isUser, userCode, dept, subject, key } = req.body;
    let history;
    let index;

    async function returnEmployeeHistory(org, sessionCode) {
      const result = await EmployeeHistory.findOne({
        org,
        sessionCode,
      });

      if (!result) {
        throw new Error("Employee history not found");
      }

      return result;
    }

    function returnIndex(history) {
      const result = history.history.findIndex((h) => h.code === userCode);

      if (result >= 0) {
        return result;
      } else {
        return -1;
      }
    }

    async function returnStudentHistory(org, sessionCode) {
      const result = await StudentHistory.findOne({ org, sessionCode, subject, department: dept });

      if (!result) {
        throw new Error("Student history not found");
      }

      return result;
    }

    if (!sessionCode || !type || !isUser || !userCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (isUser === "employee") {
      const org = req.session.user.code;
      const userName = (await Employee.findOne({ code: userCode }))?.name;
      const today = fullTime();
      const shiftType = today.hours >= 6 && today.hours < 18 ? "day" : "night";
      const schedule = await Schedule.findOne({ org });
      const week = fullweek();

      const shiftSchedule = schedule.week?.[week]?.[shiftType];
      const grace = schedule.grace || 0;

      const currentMinutes = timeToMinutes(today.hours, today.minutes);
      const startMinutes = timeToMinutes(
        shiftSchedule.check_in.split(":")[0],
        shiftSchedule.check_in.split(":")[1],
      );

      if (type === "check-in") {
        let matchFoundAt = -1;
        history = await returnEmployeeHistory(org, sessionCode);
        index = returnIndex(history);

        if (matchFoundAt < 0) {
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
          );
        }
      } else if (type === "check-out") {
        history = await returnEmployeeHistory(org, sessionCode);
        let index = returnIndex(history);

        if (index === -1) {
          return res.status(400).json({
            success: false,
            message: "User didn't check-in earlier.",
          });
        }
        else {
          const checkOut = history.history[index].checkOut;

          if (checkOut === null) {
            await EmployeeSummary.findOneAndUpdate(
              { org: org, code: userCode, shift: shiftType, month: getMonthKey() },
              {
                $inc: {
                  attended: 1,
                },
              },
              { new: true },
            );
          }
        }

        await EmployeeHistory.findOneAndUpdate(
          { org, sessionCode },
          {
            $set: {
              [`history.${index}.checkOut`]: today.now,
            },
          },
          { new: true }
        );
      }
    } else {
      const userModel = resolveUserModel(type);
      const user = await userModel.findOne({ code: userCode });
      const org = user.org;

      history = await returnStudentHistory(org, sessionCode);
      index = returnIndex(history);

      if (index === -1) {
        await StudentHistory.findOneAndUpdate(
          { org, sessionCode, subject, department: dept },
          {
            $push: {
              history: {
                code: userCode,
                sessionKey: key,
                name: user.name,
                date: fullTime()?.now,
                isMarked: false,
              },
            },
          },
        );
      }

      history = await returnStudentHistory(org, sessionCode);
      index = returnIndex(history);

      if (index >= 0) {
        const isMarked = history.history[index].isMarked;

        if (!isMarked) {
          await StudentSummary.findOneAndUpdate(
            { org: org, code: userCode, subject: subject, department: dept },
            {
              $inc: {
                attended: 1,
              },
            },
            { new: true },
          );

          await StudentHistory.findOneAndUpdate(
            { org, sessionCode, subject, department: dept },
            {
              $set: {
                [`history.${index}.isMarked`]: true,
              },
            },
            { new: true },
          );
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "couldn't retrieve student history.",
        });
      }
    }

    return res.json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (err) {
    console.error("Attendance marking failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Attendance marking failed",
    });
  }
}
