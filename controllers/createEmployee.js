const Employee = require('../models/Employee');
const { EmployeeSummary } = require('../models/attendanceSummary');
const Org = require('../models/Org');
const bcrypt = require('bcrypt');
const Counter = require('../models/counter');

exports.createEmployee = async (req, res) => {
    try {
        const {
            userName,
            employeeId,
            workType,
            designation,
            dept,
            contact,
            email,
            password,
            orgName,
            orgBranch,
            termsCheck,
        } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let counterDoc = await Counter.findOne();

        const newEmployeeNumber = (Number(counterDoc.newEmployeeValue) + 1).toString();
        counterDoc.newEmployeeValue = newEmployeeNumber;
        await counterDoc.save();


        const findOrg = await Org.findOne({
            orgName: { $regex: new RegExp(`^${orgName}$`, 'i') },
            orgBranch: { $regex: new RegExp(`^${orgBranch}$`, 'i') }
        });

        if (!findOrg) {
            return res.send(`<h2>❌ Error: Organization not found</h2>`);
        }
        else {
            const newEmployee = await Employee.create({
                uniqueId: newEmployeeNumber,
                org: findOrg.uniqueId,
                userName,
                employeeId,
                dept,
                workType,
                designation,
                contact,
                email,
                password: hashedPassword,
                termsCheck
            });

            const summary = await EmployeeSummary.create({
                employee: newEmployee.uniqueId,
                totalDays: 0,
                attendedDays: 0,
                percentage: 0,
            });

            newEmployee.attendanceSummary = summary._id;
            await newEmployee.save();
            const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ip = rawIP?.split(',')[0].trim();

            findOrg.logs.push({
                logType: "registerLogs",
                ipAddress: ip,
                activity: `New employee (${userName}, ID: ${newEmployee.employeeId}, designation: ${newEmployee.designation}) registered.`,
                timestamp: Date.now()
            });

            findOrg.registeredEmployees += 1;
            await findOrg.save();

            res.redirect('/login')
        }

    } catch (err) {
        console.error(err);
        res.send(`<h2>❌ Error: ${err.message}</h2>`);
    }
};