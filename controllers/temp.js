const RegisterLogs = require('../models/logs/register');
const Employee = require('../models/users/employee');
const CollegeStudent = require('../models/users/college-student');
const SchoolStudent = require('../models/users/school-student');
const Org = require('../models/users/organization');
const StudentSummary = require('../models/statistics/student-summary');
const EmployeeSummary = require('../models/statistics/employee-summary');

exports.updateDatabase = async (req, res) => {
  const result = await EmployeeSummary.deleteOne(
    {name: "keshav reddy"},
    {new: true}
  );

  await Employee.deleteOne({name: "keshav reddy"});

  return res.json({
    success: true
  });
}