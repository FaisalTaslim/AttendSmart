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
        console.log("Successful support DB");
    } catch(err) {
        console.error(err);
    }
}