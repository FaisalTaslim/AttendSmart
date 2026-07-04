const Org = require("../../models/users/organization");
const Employee = require("../../models/users/employee");
const resolveUserModels = require('../../utils/resolve-user-models');

async function createOrg(data, session) {
    const [org] = await Org.create([data], { session });
    return org;
}

async function createEmployee(data, session) {
    const [emp] = await Employee.create([data], { session });
    return emp;
}

async function createStudent(data, type, session) {
    const Model = resolveUserModels(type);
    const [student] = await Model.create([data], { session });
    return student;

}

module.exports = { createOrg, createEmployee, createStudent };