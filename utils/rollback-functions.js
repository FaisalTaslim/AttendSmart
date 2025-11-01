const Counter = require('../models/counter');
const Org = require('../models/Org');
const Department = require('../models/departments');
const logs = require('../models/logs');
const collegeStudent = require('../models/CollegeStudent');
const schoolStudent = require('../models/SchoolStudent');
const { FinalStudentSummary } = require('../models/overallSummary');
const { MonthlyStudentSummary } = require('../models/monthlySummary');

async function rollbackAdminCounter() {
    await Counter.updateOne(
        {},
        { $inc: { newAdminValue: -1 } }
    );
}

async function rollbackStudentCounter() {
    await Counter.updateOne(
        {},
        { $inc: { newStudentValue: -1 } }
    );
}

async function rollbackOrg(newAdminNumber) {
    await Org.findOneAndDelete({ uniqueId: newAdminNumber });
}

async function rollbackDepartment(newAdminNumber) {
    await Department.findOneAndDelete({ org: newAdminNumber });
}

async function rollbackRegisterLog(orgId, logMessage, newMessage) {
    const getRegisterLogs = (await logs.findOne({ org: orgId }))?.registerLogs;
    let getIndex = 0;

    for (const log of getRegisterLogs) {
        if (log == logMessage)
            getIndex += 1
    }

    await logs.findOneAndUpdate(
        { org: orgId },
        {
            $push: { registerLogs: newMessage },
            $pop: { registerLogs: logMessage }
        },
        { new: true }
    )
}

async function rollbackStudent(orgId, systemId, orgType) {
    if (orgType == 'school')
        await schoolStudent.findOneAndDelete({ org: orgId, uniqueId: systemId });
    else if (orgType == 'college')
        await collegeStudent.findOneAndDelete({ org: orgId, uniqueId: systemId });
}

async function rollbackSummary(orgId, systemId, summaryType) {
    if (summaryType === "final")
        await FinalStudentSummary.deleteMany({ org: orgId, student: systemId });
    else
        await MonthlyStudentSummary.deleteMany({ org: orgId, student: systemId });
}


module.exports = { rollbackAdminCounter, rollbackStudentCounter, rollbackSummary, rollbackOrg, rollbackDepartment, rollbackStudent, rollbackRegisterLog };