const Employee = require('../../../models/users/employee');
const Summary = require('../../../models/statistics/employee-summary')
const Session = require('../../../models/statistics/employee-session');
const moment = require('moment');

exports.getFaceData = async (req, res) => {
    try {
        const query = {
            "setup.faceUploaded": true,
            isDeleted: false,
            isSuspended: false
        };

        const orgFromQuery = req.query.org;
        const sessionCode = req.session?.user?.code;

        if (orgFromQuery) {
            query.org = orgFromQuery;
        } else if (sessionCode) {
            const loggedEmployee = await Employee.findOne(
                {
                    code: sessionCode,
                    isDeleted: false,
                    isSuspended: false
                },
                { org: 1, _id: 0 }
            );

            if (loggedEmployee?.org) {
                query.org = loggedEmployee.org;
            }
        }

        const employees = await Employee.find(query, { code: 1, name: 1, faceData: 1, _id: 0 });

        res.json(employees);
    } catch (error) {
        console.error("Error fetching employee face data:", error);
        res.status(500).json({ error: "Failed to fetch face data" });
    }
};

exports.incrementAttendance = async (req, res) => {
    try {
        const employeeCode = req.body.code;

        if (!employeeCode) {
            return res.status(400).json({ success: false, error: "Employee code is required" });
        }

        const recognizedEmployee = await Employee.findOne(
            {
                code: employeeCode,
                isDeleted: false,
                isSuspended: false
            },
            { code: 1, org: 1, shift: 1, _id: 0 }
        );

        if (!recognizedEmployee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }

        const now = new Date();
        const activeSession = await Session.findOne(
            {
                code: recognizedEmployee.org,
                shiftType: recognizedEmployee.shift,
                status: 'active',
                expiresAt: { $gt: now }
            },
            { sessionCode: 1, _id: 0 }
        );

        if (!activeSession) {
            return res.status(409).json({ success: false, error: "No active session for this employee shift" });
        }

        const updateResult = await Summary.updateOne(
            {
                code: recognizedEmployee.code,
                org: recognizedEmployee.org,
                shift: recognizedEmployee.shift,
                month: moment().format("YYYY-MM"),
                "markedSessions.sessionCode": { $ne: activeSession.sessionCode }
            },
            {
                $inc: { attended: 1 },
                $push: {
                    markedSessions: {
                        sessionCode: activeSession.sessionCode,
                        date: new Date(),
                        isMarked: true
                    }
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            const existingSummary = await Summary.findOne({
                code: recognizedEmployee.code,
                org: recognizedEmployee.org,
                shift: recognizedEmployee.shift,
                month: moment().format("YYYY-MM")
            });

            if (!existingSummary) {
                return res.status(404).json({ success: false, error: "Employee summary not found" });
            }

            return res.status(200).json({ success: true, message: "Already marked for this session" });
        }

        res.json({ success: true, message: `Attendance marked for ${employeeCode}` });

    } catch (error) {
        console.error("Attendance increment error:", error);
        res.status(500).json({ success: false, error: "Failed to mark attendance" });
    }
};
