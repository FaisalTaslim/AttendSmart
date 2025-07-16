const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Org = require('../models/Org');

router.post('/create-org', async (req, res) => {
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

        const newOrg = {
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
});

module.exports = router;
