const Session = require('../../../models/statistics/employee-session');
const generateCode = require('../../../utils/functions/codes');
const employeeSummary = require('../../../models/statistics/employee-summary');
const mongoose = require('mongoose');

exports.employee = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const code = req.session.user.code;
        const instigator = req.session.user.name;

        const hour = new Date().getHours();

        const shiftMap = {
            day: (h) => h >= 9 && h < 16,
            night: (h) => h < 9 || h >= 16
        };

        const shiftType = Object.keys(shiftMap).find(key => shiftMap[key](hour));
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000);
        const existingActiveSession = await Session.findOne(
            {
                code,
                instigator,
                status: 'active',
                expiresAt: { $gt: now }
            },
            null,
            { session }
        );

        if (existingActiveSession) {
            await session.abortTransaction();
            session.endSession();

            req.session.popupMessage = "An active session already exists";
            req.session.popupType = "info";
            return res.redirect('/dashboard/admin');
        }

        const sessionCode = generateCode(6, "numeric");

        await Session.create([{
            sessionCode,
            code,
            instigator,
            shiftType,
            expiresAt
        }], { session })

        await employeeSummary.updateMany(
            {
                org: code,
                shift: shiftType
            },
            { $inc: { total: 1 } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        req.session.popupMessage = "Session Created Successfully";
        req.session.popupType = "success";
        res.redirect('/dashboard/admin');

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Session creation error:", error);
        req.session.popupMessage = "Session Creation Failed!";
        req.session.popupType = "error";
        res.redirect('/dashboard/admin');
    }
};
