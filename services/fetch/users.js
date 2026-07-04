const Org = require("../../models/users/organization");
const Employee = require("../../models/users/employee");
const resolveUserModels = require("../../utils/resolve-user-models");

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

async function returnEmployee(obj) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid object sent!");
    }
    return Employee.findOne(obj);
  } catch (err) {
    throw err;
  }
}

async function returnStudent(obj, type) {
  try {
    const Model =
      type === "college-student"
        ? resolveUserModels("college-student")
        : resolveUserModels("school-student");

    if (typeof obj === "object" || (obj === null && Model)) {
      return Model.findOne(obj);
    } else {
      throw new Error("Invalid object sent!");
    }
  } catch (err) {
    throw err;
  }
}

module.exports = { returnOrg, returnEmployee, returnStudent };