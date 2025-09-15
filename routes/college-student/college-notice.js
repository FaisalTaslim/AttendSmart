const express = require("express");
const router = express.Router();
const Notice = require("../../models/notice");
const CollegeStudent = require("../../models/CollegeStudent");

router.get("/notices", async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await CollegeStudent.findOne({ uniqueId: userId });
        if (!user) {
            return res.status(404).send("User not found");
        }
        const { org, uniqueId, roll } = user;

        const allNotices = await Notice.find({ uniqueId: org });

        const filteredNotices = allNotices.filter(notice => {
            if (!notice.userIdType && !notice.userIdValue) {
                return true;
            }
            if (notice.userIdType === "uniqueUserId" && notice.userIdValue === uniqueId) {
                return true; 
            }
            if (notice.userIdType === "rollNo" && notice.userIdValue === roll) {
                return true; 
            }
            return false;
        });

        res.render("view-dashboards/collegeUser", { notices: filteredNotices });

    } catch (err) {
        console.error("Error fetching notices:", err);
        res.status(500).send("Server error");
    }
});

module.exports = router;
