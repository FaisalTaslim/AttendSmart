const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { EmployeeSummary } = require('../models/attendanceSummary');
const checkRole = require('../middleware/roleMiddleware');

router.get('/', checkRole(['Employee']), async (req, res) => {
    try {
        const user = req.session.user.uniqueId;
        const findUser = await Employee.findOne({ uniqueId: user });

        if (!findUser) return res.status(404).send("User not found");

        const { uniqueId, employeeId, userName, designation, contact, email } = findUser;

        res.render('view-dashboards/teachingStaff', {
            uniqueId,
            employeeId,
            userName,
            designation,
            contact,
            email,
        });

    } catch (error) {
        console.error("Error loading employee dashboard:", error);
        res.status(500).send("Something went wrong.");
    }
});

module.exports = router;
