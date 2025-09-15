const express = require('express');
const router = express.Router();
const Notice = require('../../models/notice');
const moment = require('moment');

router.post('/', async (req, res) => {
    console.log("✅ Notice route reached!");
    try {
        console.log("📩 Incoming notice form body:", req.body);
        const { uniqueId, dateTime, userIdType, userIdValue, noticeText } = req.body;

        if (!uniqueId || !dateTime || !noticeText) {
            return res.status(400).send("Missing required fields");
        }

        const newNotice = new Notice(
            { 
                uniqueId, 
                dateTime: moment().format("DD-MM-YYYY HH:mm:ss"),
                userIdType, 
                userIdValue, 
                noticeText 
            }
        );
        await newNotice.save();

        console.log("Notice saved successfully");
        res.redirect('/dashboard/admin');
    } catch (error) {
        console.error("Error saving notice:", error);
        res.status(500).send("Server error while saving notice");
    }
});

module.exports = router;