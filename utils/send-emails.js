const transporter = require('../config/mailer');

async function sendRegistrationMail(to, userName, uniqueId, role = 'Student') {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; background: #fff; margin: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <div style="background-color: #4a90e2; color: white; padding: 20px; text-align: center;">
                    <h2>${role === 'Admin' ? 'Organization Registered!' :
                        role === 'Employee' ? 'Welcome to AttendSmart, Employee!' :
                        'Welcome to AttendSmart!'
                    }</h2>

                </div>
                <div style="padding: 20px; color: #333;">
                    <p>Hi <strong>${userName}</strong>,</p>
                    <p>${role === 'Admin'
            ? 'Your organization has been successfully registered on AttendSmart!'
            : 'Your account has been successfully registered in our system!'}</p>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>👤| Name:</strong> ${userName}</li>
                        <li><strong>📧| Email:</strong> ${to}</li>
                        <li><strong>🆔| Unique ID:</strong> ${uniqueId}</li>
                    </ul>
                    <p style="margin-top: 20px;">You can now log in and start managing your dashboard. Use this Unique Id to register into your account</p><br>
                    <p style="margin-top: 20px;">This is an auto-generate email. Please do not reply back!</p>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="" style="background-color: #4a90e2; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Login Now</a>
                    </div>
                </div>
                <div style="background-color: #f0f0f0; text-align: center; padding: 10px; color: #555;">
                    <small>© ${new Date().getFullYear()} AttendSmart. All rights reserved.</small>
                </div>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"AttendSmart Admin" <${process.env.EMAIL_USER}>`,
            to,
            subject: role === 'Admin'
                ? 'Your Organization is Registered - Welcome to AttendSmart!'
                : 'Registration Successful - Welcome to AttendSmart!',
            html: htmlContent
        });
        console.log(`✅ ${role} registration email sent to ${to}`);
    } catch (error) {
        console.error('❌ Failed to send registration email:', error);
    }
}

async function sendVerificationEmail(to, token, code, role, secondary_role=null) {
    const link = `http://localhost:3000/verify/${token}/${role}/${code}/${secondary_role}`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Verify your organization",
        html: `
            <p>Click the link below to verify your organization:</p>
            <a href="${link}">${link}</a>
        `
    });
}


module.exports = {
    sendRegistrationMail,
    sendVerificationEmail
};