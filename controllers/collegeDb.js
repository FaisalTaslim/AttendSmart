const express = require('express');
const router = express.Router();
const collegeStudent = require('../models/CollegeStudent');
const checkRole = require('../middleware/roleMiddleware');

router.get('/', checkRole(['CollegeStudent']), async (req, res) => {
    try {
        const user = req.session.user.uniqueId;
        const findUser = await collegeStudent.findOne({ uniqueId: user });

        if (!findUser) return res.status(404).send("User not found");

        const { uniqueId, userName, roll, dept, contact, email } = findUser;

        res.render('view-dashboards/collegeUser', {
            uniqueId,
            userName,
            roll,
            dept,
            contact,
            email,
        });

    } catch (error) {
        console.error("Error loading employee dashboard:", error);
        res.status(500).send("Something went wrong.");
    }
});

module.exports = router;
