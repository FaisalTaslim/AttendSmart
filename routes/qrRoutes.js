const express = require('express');
const router = express.Router();
const ensureLoggedIn = require('../middleware/authMiddleware');
const Org = require('../models/Org');
const QRCode = require('qrcode');

function generateEmployeeCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

router.get('/', ensureLoggedIn, async (req, res) => {
    try {
        const orgId = req.session.user.uniqueId;
        const getOrg = await Org.findOne({ uniqueId: orgId });

        if (!getOrg) {
            return res.status(404).send('Organization not found');
        }

        const code = generateEmployeeCode();
        getOrg.employeeCode = code;
        await getOrg.save();

        const qrData = {
            uniqueId: orgId,
            employeeCode: code
        };

        const qrString = JSON.stringify(qrData);
        const qrImage = await QRCode.toDataURL(qrString);

        res.render('qrPage', { qrImage });

    } catch (err) {
        console.error('QR generation error:', err);
        res.status(500).send('Could not generate QR code');
    }
});

module.exports = router;
