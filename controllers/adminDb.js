const express = require('express');
const router = express.Router();
const Org = require('../models/Org');
const checkRole = require('../middleware/roleMiddleware');
const generateEmployeeQR = require('../utils/generateEmployeeQr.js');

router.get('/', checkRole(['Org']), async (req, res) => {
    try {
        const user = req.session.user.uniqueId;
        const findUser = await Org.findOne({ uniqueId: user });

        const { uniqueId, admin, orgType } = findUser;
        const adminId = admin[0]?.adminId;
        const adminName = admin[0]?.adminName;
        const adminEmail = admin[0]?.adminEmail;
        const adminContact = admin[0]?.adminContact;

        const sessionInstigator = req.session.user.name; 
        const { employeeCode, qrImage } = await generateEmployeeQR(sessionInstigator);

        res.render('view-dashboards/admin', {
            uniqueId,
            adminName,
            adminId,
            adminContact,
            adminEmail,
            orgType,
            employeeCode,
            qrImage
        });

    } catch (error) {
        console.error("Error loading admin dashboard:", error);
        res.status(500).send("Something went wrong.");
    }
});

module.exports = router;
