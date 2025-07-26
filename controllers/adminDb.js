const express = require('express');
const router = express.Router();
const Org = require('../models/Org');
const checkRole = require('../middleware/roleMiddleware');

router.get('/', checkRole(['Org']), async (req, res) => {
    try {
        const user = req.session.user.uniqueId;
        const findUser = await Org.findOne({ uniqueId: user });

        const {uniqueId, admin} = findUser;
        const adminId = admin[0]?.adminId;
        const adminName = admin[0]?.adminName;
        const adminEmail = admin[0]?.adminEmail;
        const adminContact = admin[0]?.adminContact;

        const logs = findUser.logs;

        res.render('view-dashboards/admin', {
            uniqueId,
            adminName,
            adminId,
            adminContact,
            adminEmail,
            logs,
        });

    } catch (error) {
        console.error("Error loading employee dashboard:", error);
        res.status(500).send("Something went wrong.");
    }
});

module.exports = router;
