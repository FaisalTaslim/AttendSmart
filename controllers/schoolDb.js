const express = require('express');
const router = express.Router();
const schoolStudent = require('../models/SchoolStudent');
const checkRole = require('../middleware/roleMiddleware');

router.get('/', checkRole(['SchoolStudent']), async (req, res) => {
    try {
        const user = req.session.user.uniqueId;
        const findUser = await schoolStudent.findOne({ uniqueId: user });

        if (!findUser) return res.status(404).send("User not found");

        const { uniqueId, roll, userName, contact, email } = findUser;

        res.render('view-dashboards/schoolUser', {
            uniqueId,
            userName,
            roll,
            contact,
            email,
        });

    } catch (error) {
        console.error("Error loading employee dashboard:", error);
        res.status(500).send("Something went wrong.");
    }
});

module.exports = router;