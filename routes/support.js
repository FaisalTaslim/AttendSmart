const express = require("express");
const router = express.Router();
const logs = require("../models/logs");
const devSupport = require("../models/devSupport")
const ensureLoggedIn = require('../middleware/authMiddleware');
const moment = require('moment');

router.post("/", ensureLoggedIn, async (req, res) => {
    try {
        const { org, userId, email, userName, supportType, thoughts } = req.body;

        if (!org || !userId || !supportType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const role = req.session?.user?.role || "Unknown";

        const updatedLog = await logs.findOneAndUpdate(
            { org },
            {
                $push: {
                    supportLogs: {
                        userId,
                        userName,
                        role,
                        email,
                        supportType,
                        thoughts,
                    },
                },
            },
            { upsert: true, new: true }
        );

        const newSupport = new devSupport({
            org,
            userId,
            userName,
            email,
            supportType,
            thoughts,
            createdAt: moment().format("DD-MM-YYYY HH:mm:ss")
        });

        await newSupport.save();

        res.status(200).json({
            message: "Support log saved successfully",
        });
    } catch (error) {
        console.error("Error saving support log:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;