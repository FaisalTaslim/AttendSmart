const CollegeStudent = require('../../models/users/college-student');
const SchoolStudent = require('../../models/users/school-student');
const Employee = require('../../models/users/employee');

module.exports = function resolveUserModel(role) {
  switch (role) {
    case 'college-student':
      return CollegeStudent;

    case 'school-student':
      return SchoolStudent;

    case 'employee':
      return Employee;

    default:
      return null;
  }
};