const AttendanceOtp = require('../../../../models/attendance/attendanceOtp');
const sendOtpEmail = require('../../../../utils/emails/attendanceOtp');
const schoolStudent = require('../../../../models/users/school-student');
const collegeStudent = require('../../../../models/users/college-student');

exports.verifyOtp = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: "Session expired. Please login again." });
        }

        let { sessionCode, subject } = req.body;
        const studentCode = req.session.user.code;
        const studentEmail = req.session.user.email;
        const studentName = req.session.user.name;

        if(subject === "null") {
            subject = null;
        }

        if (!sessionCode || !subject) {
            return res.json({ success: false, message: "Subject and Session Code are required." });
        }

        let getStudent, getOrg;

        getStudent = await schoolStudent.findOne({code: studentCode});
        if(!getStudent) getStudent = await collegeStudent.findOne({code: studentCode});

        if (!getStudent) {
            return res.json({ success: false, message: "Student not found." });
        }

        getOrg = getStudent.org;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await AttendanceOtp.create({
            org: getOrg,
            studentCode,
            sessionCode,
            subject,
            otp,
            expiresAt
        });

        await sendOtpEmail(studentEmail, studentName, otp, subject, sessionCode);

        return res.json({ success: true, message: "OTP sent to your email." });
    } catch (err) {
        console.error("Error sending OTP:", err);
        return res.json({ success: false, message: "Failed to send OTP." });
    }
};