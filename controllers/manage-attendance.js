const collegeStudent = require('../models/CollegeStudent');
const schoolStudent = require('../models/SchoolStudent');
const employee = require('../models/Employee');
const Org = require('../models/Org');
const { FinalStudentSummary, FinalEmployeeSummary } = require('../models/overallSummary');
const { MonthlyStudentSummary, MonthlyEmployeeSummary } = require('../models/monthlySummary');
const moment = require('moment');

exports.edit = async (req, res) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const codeData = req.body;
        const { ids, names, subjects, userType, totalDays, attendedDays, leaveDays } = codeData;
        let storeIds;
        let storeNames;
        let storeSubjects;

        if(ids.includes(',') || names.includes(','), subjects.includes(',')) {
            storeIds = ids.split(',').trim();
            storeNames = names.split(',').trim();
            storeSubjects = names.split(',').trim();
        }

    } catch (err) {
        console.error("Error in edit function:", err);
        res.status(500).json({ error: "Server error" });
    }
};