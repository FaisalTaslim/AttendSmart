const Counter = require('../models/counter');
const bcrypt = require('bcrypt');
const Org = require('../models/Org');

exports.createOrg = async (req, res) => {
    try {
        const {
            adminName,
            adminId,
            adminContact,
            adminEmail,
            adminPassword
        } = req.body.admin[0];

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        let counterDoc = await Counter.findOne();

        const newAdminNumber = (Number(counterDoc.newAdminValue) + 1).toString();
        counterDoc.newAdminValue = newAdminNumber;
        await counterDoc.save();

        const newOrg = {
            uniqueId: newAdminNumber,
            ...req.body,
            admin: [
                {
                    adminName,
                    adminId,
                    adminContact,
                    adminEmail,
                    adminPassword: hashedPassword,
                }
            ]
        };

        const orgData = await Org.create(newOrg);

        console.log(`✅ Organization ${orgData.orgName} registered successfully`);
        res.redirect('/');
    } catch (err) {
        res.send(`<h2>❌ Error: ${err.message}</h2>`);
    }
};
