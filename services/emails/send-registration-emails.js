const transporter = require("../../config/mailer");
const normalizeString = require("../../utils/normalize-strings");

async function sendRegistrationMail(to, code, role = "Student") {
  const htmlContent = `
  <div style="background:#f3f6fb;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;
                box-shadow:0 8px 24px rgba(0,0,0,.08);">

      <!-- Header -->
      <div style="background:#111827;padding:24px 30px;">
        <h1 style="margin:0;color:#fff;font-size:24px;">
          AttendSmart
        </h1>
        <p style="margin:6px 0 0;color:#cbd5e1;font-size:14px;">
          Smart Attendance, Simplified
        </p>
      </div>

      <!-- Body -->
      <div style="padding:35px 30px;color:#374151;">

        <h2 style="margin-top:0;color:#111827;">
          Registration Successful 🎉
        </h2>

        <p style="font-size:15px;line-height:1.7;">
          Your <strong>${role}</strong> account has been successfully verified and activated.
        </p>

        <p style="font-size:15px;line-height:1.7;">
          You can now log in to your AttendSmart dashboard using the credentials you created during registration.
        </p>

        <div style="
          margin:28px 0;
          background:#f9fafb;
          border:1px solid #e5e7eb;
          border-radius:8px;
          padding:20px;
        ">
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
            Your Organization Code
          </p>

          <div style="
            font-size:28px;
            font-weight:bold;
            letter-spacing:4px;
            color:#111827;
            text-align:center;
          ">
            ${code}
          </div>
        </div>

        <p style="font-size:14px;color:#6b7280;">
          Keep this code safe. It may be required while logging in or for future reference.
        </p>

        <div style="text-align:center;margin:35px 0 15px;">
          <a href="http://localhost:3000/login"
            style="
              display:inline-block;
              background:#111827;
              color:#ffffff;
              text-decoration:none;
              padding:14px 32px;
              border-radius:8px;
              font-weight:bold;
              font-size:15px;
            ">
            Login to AttendSmart
          </a>
        </div>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">

        <p style="font-size:13px;color:#9ca3af;text-align:center;">
          This is an automated email. Please do not reply.
        </p>

      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:18px;text-align:center;
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
        role === "Admin"
          ? "Organization Verified | AttendSmart"
          : "Registration Successful | AttendSmart",
      html: htmlContent,
    });

    console.log(`✅ ${role} registration email sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send registration email:", err);
  }
}

async function sendVerificationEmail(
  to,
  code,
  token,
  role,
  secondary_role = null,
) {
  const params = new URLSearchParams({ token, code, role, secondary_role });
  const link = `http://localhost:3000/register/verify?${params}`;

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
        `,
  });
}

module.exports = {
  sendRegistrationMail,
  sendVerificationEmail,
};
