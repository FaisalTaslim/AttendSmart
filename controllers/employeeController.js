const Employee = require('../models/Employee');
const { EmployeeSummary } = require('../models/attendanceSummary');
const Org = require('../models/Org');
const bcrypt = require('bcrypt');

exports.createEmployee = async (req, res) => {
    try {
        const {
            userName,
            employeeId,
            workType,
            designation,
            contact,
            email,
            password,
            orgName,
            orgBranch,
        } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const findOrg = await Org.findOne({ orgName, orgBranch });
        if (!findOrg) {
            return res.send(`<h2>❌ Error: Organization not found</h2>`);
        }

        const newEmployee = await Employee.create({
            userName,
            employeeId,
            workType,
            designation,
            contact,
            email,
            password: hashedPassword,
            orgId: findOrg._id
        });

        const summary = await EmployeeSummary.create({
            employee: newEmployee._id,
            totalDays: 0,
            attendedDays: 0,
            percentage: 0
        });

        newEmployee.attendanceSummary = summary._id;
        await newEmployee.save();

        res.send(`<h2>✅ Employee created and attendance summary saved!</h2>`);

    } catch (err) {
        console.error(err);
        res.send(`<h2>❌ Error: ${err.message}</h2>`);
    }
};