const Employee = require('../../models/users/employee');
const SchoolStudent = require('../../models/users/college-student');
const CollegeStudent = require('../../models/users/school-student');

exports.faceData = async (req, res) => {
    const user = req.query.user;
    const dept = req.query.dept;
}