const bcrypt = require("bcrypt");
const Org = require("../../models/users/organization");
const RegisterLog = require('../../models/logs/register');
const generateCode = require("../../utils/functions/codes");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/emails/send-register-emails");
const verifyDomains = require("../../utils/emails/verify-domains");
const mongoose = require("mongoose");


exports.register = async (req, res) => {
    const session = await mongoose.startSession();
    let setup;
    let code;
    let successMessage = "Registration successful! Please verify your email.";
    const {
        admin,
        organization,
        branch,
        address,
        type,
        website,
        attendanceMethod,
        confirmPassword,
        termsCheck
    } = req.body;

    const adminData = admin?.[0];
    const {
        name,
        adminId,
        contact,
        email,
        password
    } = adminData;
    -
    session.startTransaction();

    try {
        if(!adminData || !termsCheck || !password || (password !== confirmPassword)) {
            throw new Error("Suspicious behavior detected! Missing required fields!");
        }
    
        if (!verifyDomains(email)) {
            throw new Error("Please use your organization domain to register.");
        }

        const existingOrg = await Org.findOne({ org: organization }).session(session);
        const hashedPassword = await bcrypt.hash(password, 12);

        if (existingOrg) {
            const adminExists = existingOrg.admin?.some(existing =>
                existing.email === email || existing.adminId === adminId
            );

            if(adminExists) {
                alert("An admin already exists for this organization. Inserting another admin...");
            }

            await Org.findOneAndUpdate(
                { _id: existingOrg._id },
                {
                    $push: {
                        admin: {
                            name: name.toLowerCase().trim(),
                            adminId: adminId.toLowerCase().trim(),
                            contact,
                            email: email.toLowerCase().trim(),
                            password: hashedPassword
                        }
                    }
                },
                { session }
            );

            await RegisterLog.findOneAndUpdate(
                { org: existingOrg.code },
                {
                    $push: {
                        register: {
                            type: 'success',
                            org: existingOrg.code,
                            name: name.toLowerCase().trim(),
                            role: "admin",
                            id: adminId.toLowerCase().trim(),
                            email: email.toLowerCase().trim(),
                            contact,
                            message: "Another admin added successfully!"
                        }
                    }
                },
                { upsert: true, session }
            );

            successMessage = "Registration successful! You can now log in.";
        } else {
            let codeExists = true;

            while (codeExists) {
                code = generateCode(6, "numeric");
                const check = await Org.findOne({ code }).session(session);
                if (!check) codeExists = false;
            }

            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            if (type == 'corporate') {
                setup = {
                    "subjectsUploaded": true,
                    "scheduleUploaded": false,
                    "done": false
                }
            }
            else {
                setup = {
                    "subjectsUploaded": false,
                    "scheduleUploaded": false,
                    "done": false
                }
            }

            await Org.create(
                [{
                    code,
                    org: organization,
                    branch: branch.toLowerCase().trim(),
                    type,
                    address,
                    website,
                    attendanceMethod,
                    agreement: true,
                    admin: [
                        {
                            name: name.toLowerCase().trim(),
                            adminId: adminId.toLowerCase().trim(),
                            contact,
                            email.toLowerCase().trim(),
                            password: hashedPassword
                        }
                    ],
                    settings: {
                        theme: 'light',
                    },
                    verification: {
                        status: "pending",
                        token,
                        expiresAt
                    },
                    setup: setup,
                }],
                { session }
            );

            await RegisterLog.create(
                {
                    type: 'success',
                    org: code,
                    name: name.toLowerCase().trim(),
                    id: adminId.toLowerCase().trim(),
                    role: "admin",
                    email: email.toLowerCase().trim(),
                    contact,
                    message: "Admin Registered successfully!",
                },
                { session }
            );

            await sendVerificationEmail(
                email.toLowerCase().trim(),
                token,
                code,
                "admin",
                null
            );
        }

        await session.commitTransaction();
        session.endSession();

        return res.render("index", {
            popupMessage: successMessage,
            popupType: "success"
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        await RegisterLog.create({
            type: 'failed',
            org: code || 'null',
            name: name.toLowerCase().trim() || 'null',
            id: adminId.toLowerCase().trim() || 'null',
            role: 'admin',
            email: email.toLowerCase().trim() || 'null',
            contact: contact || 'null',
            message: err.message,
        })

        return res.render("index", {
            popupMessage: err.message || "Registration failed. Please try again.",
            popupType: "error"
        });
    }
};
