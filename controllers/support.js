const supportForm = require('../models/supportForm');
const Org = require('../models/Org');

exports.createSupportDB = async (req, res) => {
    try {
        const {
            orgName,
            orgBranch,
            userName,
            userId,
            email,
            supportType,
            thoughts
        } = req.body;

        const newSupportDb = await supportForm.create({
            orgName,
            orgBranch,
            userName,
            userId,
            email,
            supportType,
            thoughts
        });

        await newSupportDb.save();

        const findOrg = await Org.findOne({
            orgName: { $regex: new RegExp(`^${orgName}$`, 'i') },
            orgBranch: { $regex: new RegExp(`^${orgBranch}$`, 'i') }
        });

        if (findOrg) {
            const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ip = rawIP?.split(',')[0].trim();

            findOrg.logs.push({
                logType: "supportLogs",
                ipAddress: ip,
                activity: `userId: ${userId} submitted a form with reason: \n${thoughts}`,
                timestamp: Date.now()
            });

            await findOrg.save();
        }
        console.log("Successful support DB");
        res.redirect('/support');

    } catch (err) {
        console.error(err);
    }
}