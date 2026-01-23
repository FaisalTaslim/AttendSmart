const express = require('express');
const router = express.Router();
const { sendRegistrationMail } = require("../../utils/send-emails");

router.get('/', async (req, res) => {
    try {
        await sendRegistrationMail(
            "faisaltaslim79@gmail.com",
            "Test User",
            "AS-102938",
            "Student"
        );

        res.send("✅ Test email sent successfully!");
    } catch (err) {
        console.error(err);
        res.status(500).send("❌ Failed to send test email");
    }
});

module.exports = router;