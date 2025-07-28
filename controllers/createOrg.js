const Counter = require('../models/counter');
const bcrypt = require('bcrypt');
const Org = require('../models/Org');
const SessionLog = require('../models/sessionLog');

exports.createOrg = async (req, res) => {
    try {
        const {
            adminName,
            adminId,
            adminContact,
            adminEmail,
            adminPassword
        } = req.body.admin[0];

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        let counterDoc = await Counter.findOne();

        const newAdminNumber = (Number(counterDoc.newAdminValue) + 1).toString();
        counterDoc.newAdminValue = newAdminNumber;
        await counterDoc.save();

        if (isNaN(req.body.expectedEmployees) && isNaN(req.body.expectedStudents)) {
            res.send(`<h2>❌ Error: Number of Employees, and students must be in digits </h2>`)
        }
        else {
            let code = '';
        
            const newOrg = {
                uniqueId: newAdminNumber,
                expectedTeachers: Number(req.body.expectedTeachers),
                expectedStudents: Number(req.body.expectedStudents),
                ...req.body,
                admin: [
                    {
                        adminName,
                        adminId,
                        adminContact,
                        adminEmail,
                        adminPassword: hashedPassword,
                    }
                ],
                employeeCode: code
            };

            const orgData = await Org.create(newOrg);
            console.log(`✅ Organization ${orgData.orgName} registered successfully`);
            res.redirect(`/login`);
        }
    } catch (err) {
        res.send(`<h2>❌ Error: ${err.message}</h2>`);
    }
};
