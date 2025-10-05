const moment = require("moment");
const { MonthlyStudentSummary } = require("../models/monthlySummary");
const SchoolStudent = require("../models/SchoolStudent");
const CollegeStudent = require("../models/CollegeStudent");

exports.monthlyStudentSummary = async (req, res) => {
    try {
        const role = req.session.user.role;
        const userId = req.session.user.uniqueId;
        let student;
        let studentClass; // ✅ renamed

        if (role === "CollegeStudent") {
            student = await CollegeStudent.findOne({ uniqueId: userId });
            studentClass = student.dept;
        } else {
            student = await SchoolStudent.findOne({ uniqueId: userId });
            studentClass = student.standard;
        }

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const subjects = student.subjects || [];
        const monthKey = moment().format("YYYY-MM");

        for (const subject of subjects) {
            const exists = await MonthlyStudentSummary.findOne({
                org: student.org,
                student: student.uniqueId,
                subjectName: subject,
                month: monthKey,
            });

            if (!exists) {
                await MonthlyStudentSummary.create({
                    org: student.org,
                    student: student.uniqueId,
                    studentName: student.userName,
                    std_dept: studentClass,
                    subjectName: subject,
                    month: monthKey,
                    totalLectures: 0,
                    attendedLectures: 0,
                    leaveDays: 0,
                    percentage: 0,
                });

                console.log(`✅ Attendance summary created for subject: ${subject} for month ${monthKey}`);
            } else {
                console.log(`⚠️ Already exists for ${subject} in ${monthKey}, skipping.`);
            }
        }

        res.redirect("/dashboard");
    } catch (err) {
        console.error("Error in createMonthlySummary:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
