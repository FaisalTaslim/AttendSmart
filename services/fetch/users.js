const Org = require("../../models/users/organization");
const Employee = require("../../models/users/employee");

async function returnOrg(obj) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid object sent!");
    }
    return Org.findOne(obj);
  } catch (err) {
    throw err;
  }
}

async function returnEmployee(code) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid object sent!");
    }
    return Employee.findOne(code);
  } catch (err) {
    throw err;
  }
}

module.exports = { returnOrg, returnEmployee };