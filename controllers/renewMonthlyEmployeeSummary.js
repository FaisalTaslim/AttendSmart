const moment = require("moment");
const { MonthlyEmployeeSummary } = require("../models/monthlySummary");
const Employee = require("../models/Employee");

exports.monthlyEmployeeSummary = async (req, res) => {
    try {
        const userId = req.session.user.uniqueId;
        const employee = await Employee.findOne({ uniqueId: userId });

        if (!employee) {
            return res.status(404).json({ message: "Student not found" });
        }
        const monthKey = moment().format("YYYY-MM");
        await MonthlyEmployeeSummary.create({
            org: employee.org,
            employee: employee.uniqueId,
            employeeName: employee.userName,
            emp_dept: employee.dept,
            shift: employee.shift,
            month: monthKey,
            totalLectures: 0,
            attendedLectures: 0,
            leaveDays: 0,
            percentage: 0,
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error("Error in createMonthlySummary:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
