const CollegeStudent = require('../../models/users/college-student');
const SchoolStudent = require('../../models/users/school-student');
const Employee = require('../../models/users/employee');
const Org = require('../../models/users/organization');

module.exports = function resolveUserModel(role) {
  switch (role) {
    case 'admin':
      return Org;

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