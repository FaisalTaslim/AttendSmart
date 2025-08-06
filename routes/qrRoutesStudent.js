const express = require('express');
const router = express.Router();
const ensureLoggedIn = require('../middleware/authMiddleware');

const Org = require('../models/Org');
const Employee = require('../models/Employee');
const QRCode = require('qrcode');
const { generateUserCode } = require('./qrRoutesEmployee');

router.get('/', ensureLoggedIn, async (req, res) => {
    try {
        const userId = req.session.user.uniqueId;
        let role = req.session.user.role;
        let users, org;

        if (role === 'Employee') {
            users = await Employee.findOne({ uniqueId: userId });
            org = await Org.findOne({ uniqueId: users.org });
        }

        if (role === 'Org') {
            users = await Org.findOne({ uniqueId: userId });
            org = users;
        }

        const subject = req.query.subject || 'Unknown';
        const code = generateUserCode();

        let sessionInstigator;
        if (role === 'Org') sessionInstigator = users.admin[0].adminName;
        else sessionInstigator = user.userName;

        const newSession = new SessionLog({
            studentCode: code,
            sessionInstigator: sessionInstigator,
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
