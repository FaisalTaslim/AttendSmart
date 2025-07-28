const express = require('express');
const router = express.Router();
const ensureLoggedIn = require('../middleware/authMiddleware');

const Org = require('../models/Org');
const Employee = require('../models/Employee');
const QRCode = require('qrcode');
const {generateUserCode } = require('./qrRoutes');
const SessionLog = require('../models/sessionLog');

router.get('/', ensureLoggedIn, async (req, res) => {
    try {
        const userId = req.session.user.uniqueId;

        const user = await Employee.findOne({ uniqueId: userId });
        if (!user) return res.status(404).send('Employee not found');

        const org = await Org.findOne({ uniqueId: user.org });
        if (!org) return res.status(404).send('Organization not found');

        const subject = req.query.subject || 'Unknown';
        const code = generateUserCode();

        const newSession = new SessionLog({
            studentCode: code,
            sessionInstigator: user.userName,
            subjectName: subject,
            orgUniqueId: org.uniqueId,
            createdAt: Date.now()
        });

        await newSession.save();

        const qrData = {
            uniqueId: org.uniqueId,
            subjectName: subject,
            studentCode: code
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
