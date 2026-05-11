const transporter = require('../../config/mailer');

async function sendAttendanceOtp(to, studentName, otp, subjectName, sessionCode) {
    const htmlContent = `
    <div style="font-family:Arial,sans-serif;background:#f4f4f4;padding:30px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;padding:20px;box-shadow:0 5px 20px rgba(0,0,0,0.1);">
            <h2 style="color:#1f2937;margin-bottom:10px;">Attendance OTP</h2>
            <p style="color:#374151;font-size:15px;line-height:1.5;">
                Hi <strong>${studentName}</strong>,<br><br>
                Your attendance OTP for <strong>${subjectName}</strong> (Session: <strong>${sessionCode}</strong>) is:
            </p>
            <p style="font-size:24px;font-weight:bold;color:#2563eb;margin:20px 0;text-align:center;">
                ${otp}
            </p>
            <p style="color:#374151;font-size:14px;line-height:1.5;">
                This OTP is valid for 5 minutes. Please do not share it with anyone.
            </p>
            <p style="color:#6b7280;font-size:12px;margin-top:20px;text-align:center;">
                © ${new Date().getFullYear()} AttendSmart
            </p>
        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: `"AttendSmart" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Your Attendance OTP | AttendSmart",
            html: htmlContent
        });

        console.log(`✅ OTP email sent to ${to}`);
    } catch (err) {
        console.error(`❌ Failed to send OTP email to ${to}:`, err);
        throw err;
    }
}

module.exports = sendAttendanceOtp;