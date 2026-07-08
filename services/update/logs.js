const EmployeeAttendanceHistory = require("../../models/logs/employee-attendance-history");
const StudentAttendanceHistory = require("../../models/logs/student-attendance-history");

async function updateEmployeeAttendanceHistory(obj, data, service, session) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid data sent for updation!");
    }
    
    if(service === 'push') {
      return EmployeeAttendanceHistory.findOneAndUpdate(obj, { $push: data }, { session });
    } else {
      return EmployeeAttendanceHistory.findOneAndUpdate(obj, { $set: data }, { session });
    }
  } catch (err) {
    throw err;
  }
}

async function updateStudentAttendanceHistory(obj, data, service, session) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid data sent for updation!");
    }
    
    if(service === 'push') {
      return StudentAttendanceHistory.findOneAndUpdate(obj, { $push: data }, { session });
    } else {
      return StudentAttendanceHistory.findOneAndUpdate(obj, { $set: data }, { session });
    }
  } catch (err) {
    throw err;
  }
}

module.exports = { updateEmployeeAttendanceHistory, updateStudentAttendanceHistory };