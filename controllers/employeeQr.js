const generateEmployeeQR = require('../utils/generateEmployeeQr');
const OrgLog = require('../models/logs');
const moment = require("moment");

exports.createEmployeeSession = async (req, res) => {
    try {
        const sessionInstigator = req.session.name;
        const { employeeCode, qrImage } = await generateEmployeeQR(sessionInstigator);

        await OrgLog.findOneAndUpdate(
            { org: req.session.uniqueId },
            {
                $push: {
                    employeeSessionLogs: {
                        employeeCode,
                        sessionInstigator,
                        createdAt: moment().format("DD-MM-YYYY HH:mm:ss")
                    }
                }
            },
            { new: true, upsert: true }
        );

        res.render("employee-qr", { employeeCode, qrImage });

    } catch (err) {
        console.error("Session creation failed:", err);
        res.status(500).send("Failed to create employee session");
    }
};
