const Session = require('../../../../models/logs/student-session');
const Summary = require('../../../../models/statistics/student-summary');
const AttendanceOtp = require('../../../../models/attendance/attendanceOtp');

exports.markAttendance = async (req, res) => {
    let { sessionCode, subject, otp } = req.body;
    const studentCode = req.session.user.code;

    if(subject === "null") {
        subject = null;
    }

    const activeSession = await Session.findOne({
        sessionCode,
        subject,
        status: "active"
    });

    if (!activeSession) {
        return res.json({ success: false, message: "Invalid or inactive session." });
    }

    const validOtp = await AttendanceOtp.findOne({
        studentCode,
        sessionCode,
        subject,
        otp,
        expiresAt: { $gt: new Date() }
    });

    if (!validOtp) {
        return res.json({ success: false, message: "Invalid or expired OTP." });
    }

    const summary = await Summary.findOne({ code: studentCode, subject });
    summary.attended += 1;
    summary.percentage = summary.total > 0
        ? Number(((summary.attended / summary.total) * 100).toFixed(2))
        : 0;

    await summary.save();

    await AttendanceOtp.deleteMany({ studentCode, sessionCode });

    res.json({ success: true });
}
