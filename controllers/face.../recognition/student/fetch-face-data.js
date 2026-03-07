const express = require('express');
const router = express.Router();
const resolveUserModel = require('../../../../utils/functions/resolveUserModel');
const collegeStudent = require('../../../../models/users/college-student');
const schoolStudent = require('../../../../models/users/school-student');


exports.getFace = async (req, res) => {
    try {
        const studentCode = req.session.user.code;
        const studentRole = req.session?.user?.role;
        let student;

        const Model = studentRole ? resolveUserModel(studentRole) : null;
        if (Model) {
            student = await Model.findOne({ code: studentCode });
        } else {
            student = await schoolStudent.findOne({ code: studentCode });
            if (!student) {
                student = await collegeStudent.findOne({ code: studentCode });
            }
        }
        
        if (!student || !student.faceData?.descriptors.length) {
            return res.status(404).json({ success: false, message: "No face data found." });
        }

        res.json({
            code: student.code,
            descriptors: student.faceData.descriptors
        });
    } catch (err) {
        console.error("Error fetching face data:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
