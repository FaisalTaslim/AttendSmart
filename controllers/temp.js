const RegisterLogs = require('../models/logs/register');
const Employee = require('../models/users/employee');
const CollegeStudent = require('../models/users/college-student');
const SchoolStudent = require('../models/users/school-student');
const Org = require('../models/users/organization');

exports.updateDatabase = async (req, res) => {
  try {
    console.log("Updating database...");

    const logs = await RegisterLogs.find();

    let updated = 0;
    let skipped = 0;

    for (const log of logs) {
      let code = null;

      if (log.role === 'employee') {
        const employee = await Employee.findOne({
          org: log.org,
          employeeId: log.id
        });

        if (!employee) {
          console.log("❌ Employee not found:", log.org, log.id);
          skipped++;
          continue;
        }

        code = employee.code;
      }

      else if (log.role === 'admin') {
        code = log.org;
      }

      else if (log.role === 'student') {
        const orgDoc = await Org.findOne({ code: log.org });

        if (!orgDoc) {
          console.log("❌ Org not found:", log.org);
          skipped++;
          continue;
        }

        const orgType = (orgDoc.type || "").toLowerCase();

        let student = null;

        if (orgType === 'college') {
          student = await CollegeStudent.findOne({
            org: log.org,
            roll: log.id
          });
        }
        else if (orgType === 'school') {
          student = await SchoolStudent.findOne({
            org: log.org,
            roll: log.id
          });
        }
        else {
          console.log("❌ Unknown orgType:", orgType);
          skipped++;
          continue;
        }

        if (!student) {
          console.log("❌ Student not found:", log.org, log.id);
          skipped++;
          continue;
        }

        code = student.code;
      }

      if (code) {
        log.code = code;
        await log.save();
        updated++;
      } else {
        skipped++;
      }
    }

    return res.json({
      success: true,
      updated,
      skipped,
      total: logs.length
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};