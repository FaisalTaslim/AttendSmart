const EmployeeSummary = require("../../models/statistics/employee-summary");
const StudentSummary = require("../../models/statistics/student-summary");

async function updateEmployeeSummary(obj, data, affect, session) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid data sent for updation!");
    }
  
    if(affect === 'many') return await EmployeeSummary.updateMany(obj, { $inc: data }, { session });
    else return EmployeeSummary.findOneAndUpdate(obj, { $inc: data }, { session });
    
  } catch (err) {
    throw err;
  }
}

async function updateStudentSummary(obj, data, affect, session) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid data sent for updation!");
    }
    
    if(affect === 'many') return await StudentSummary.updateMany(obj, { $inc: data }, { session });
    else return StudentSummary.findOneAndUpdate(obj, { $inc: data }, { session });
    
  } catch (err) {
    throw err;
  }
}


module.exports = { updateEmployeeSummary, updateStudentSummary };
