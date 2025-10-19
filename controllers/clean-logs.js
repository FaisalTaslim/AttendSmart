const express = require('express');
const router = express.Router();
const logs = require('../models/logs');
const { get } = require('mongoose');

exports.cleanLogs = async (req, res) => {
    const user = req.session.user.uniqueId;
    const getLogs = await logs.findOne({ org: user });

    if (!getLogs) return res.status(404).send("No logs found");
    const logFields = [
        "registerLogs",
        "loginLogs",
        "supportLogs",
        "employeeSessionLogs",
        "studentSessionLog",
        "studentAttendanceHistory",
        "employeeAttendanceHistory"
    ];

    for (const field of logFields) {
        if (Array.isArray(getLogs[field]) && getLogs[field].length > 0) {
            const halfIndex = Math.floor(getLogs[field].length / 2);
            getLogs[field] = getLogs[field].slice(halfIndex);
        }
    }

    await getLogs.save();
    res.redirect('/dashboard/admin');
};
