const transporter = require('../config/mailer');

async function sendRegistrationMail(to, userName, uniqueId, role = 'Student') {
    const htmlContent = `
    <div style="background:#f4f6f8;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;
                    overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

            <!-- Header -->
            <div style="background:#1f2937;color:#ffffff;padding:22px 30px;text-align:left;">
                <h1 style="margin:0;font-size:22px;">AttendSmart</h1>
                <p style="margin:4px 0 0;font-size:14px;color:#d1d5db;">
                    Smart attendance, simplified
                </p>
            </div>

            <!-- Body -->
            <div style="padding:30px;color:#374151;">
                <h2 style="margin-top:0;font-size:20px;">
                    ${role === 'Admin'
            ? 'Organization Registered Successfully'
            : role === 'Employee'
                ? 'Welcome to AttendSmart'
                : 'Registration Successful'
        }
                </h2>

                <p style="font-size:15px;line-height:1.6;">
                    Hi <strong>${userName}</strong>,
                </p>

                <p style="font-size:15px;line-height:1.6;">
                    ${role === 'Admin'
            ? 'Your organization has been successfully registered on AttendSmart.'
            : 'Your account has been successfully created in our system.'
        }
                </p>

                <!-- Details -->
                <div style="margin:20px 0;padding:16px;border-radius:8px;background:#f9fafb;">
                    <p style="margin:6px 0;font-size:14px;">
                        <strong>👤 Name:</strong> ${userName}
                    </p>
                    <p style="margin:6px 0;font-size:14px;">
                        <strong>📧 Email:</strong> ${to}
                    </p>
                    <p style="margin:6px 0;font-size:14px;">
                        <strong>🆔 Unique ID:</strong> ${uniqueId}
                    </p>
                </div>

                <p style="font-size:14px;line-height:1.6;">
                    You can now log in to your dashboard using this <strong>Unique ID</strong>.
                    Please keep it safe for future access.
                </p>

                <p style="font-size:13px;color:#6b7280;margin-top:16px;">
                    This is an auto-generated email. Please do not reply.
                </p>

                <!-- CTA -->
                <div style="text-align:center;margin:30px 0;">
                    <a href=""
                       style="background:#1f2937;color:#ffffff;text-decoration:none;
                              padding:14px 28px;border-radius:6px;
                              font-size:15px;font-weight:600;display:inline-block;">
                        Login to Dashboard
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb;text-align:center;padding:15px;
                        font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} AttendSmart. All rights reserved.
            </div>

        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: `"AttendSmart" <${process.env.EMAIL_USER}>`,
            to,
            subject:
                role === 'Admin'
                    ? 'Organization Registered | AttendSmart'
                    : 'Registration Successful | AttendSmart',
            html: htmlContent
        });

        console.log(`✅ ${role} registration email sent to ${to}`);
    } catch (error) {
        console.error('❌ Failed to send registration email:', error);
    }
}


async function sendVerificationEmail(to, token, code, role, secondary_role = null) {
    const link = `http://localhost:3000/verify/${token}/${role}/${code}/${secondary_role}`;

    await transporter.sendMail({
        from: `"AttendSmart" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Verify your organization | AttendSmart",
        html: `
        <div style="background:#f4f6f8;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                
                <div style="background:#1f2937;color:#ffffff;padding:20px 30px;">
                    <h1 style="margin:0;font-size:22px;">AttendSmart</h1>
                    <p style="margin:4px 0 0;font-size:14px;color:#d1d5db;">
                        Smart attendance, simplified
                    </p>
                </div>

                <div style="padding:30px;color:#374151;">
                    <h2 style="margin-top:0;font-size:20px;">
                        Verify your organization
                    </h2>

                    <p style="font-size:15px;line-height:1.6;">
                        Thanks for registering with <strong>AttendSmart</strong>.
                        Please confirm your email address to activate your organization and start using the platform.
                    </p>

                    <div style="text-align:center;margin:30px 0;">
                        <a href="${link}"
                           style="background:#2563eb;color:#ffffff;text-decoration:none;
                                  padding:14px 28px;border-radius:6px;
                                  font-size:15px;font-weight:600;display:inline-block;">
                            Verify Organization
                        </a>
                    </div>

                    <p style="font-size:14px;color:#6b7280;line-height:1.6;">
                        If the button above doesn’t work, copy and paste the following link into your browser:
                    </p>

                    <p style="word-break:break-all;font-size:13px;color:#2563eb;">
                        ${link}
                    </p>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">

                    <p style="font-size:13px;color:#9ca3af;">
                        If you didn’t request this registration, you can safely ignore this email.
                        This verification link will expire automatically.
                    </p>
                </div>

                <div style="background:#f9fafb;text-align:center;padding:15px;font-size:12px;color:#9ca3af;">
                    © ${new Date().getFullYear()} AttendSmart. All rights reserved.
                </div>

            </div>
        </div>
        `
    });
}

module.exports = {
    sendRegistrationMail,
    sendVerificationEmail
};