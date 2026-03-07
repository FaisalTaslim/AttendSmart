const Org = require("../../../models/users/organization");
const CollegeStudent = require("../../../models/users/college-student");
const SchoolStudent = require("../../../models/users/school-student");
const OrgLog = require("../../../models/logs/logs");


exports.suspend = async (req, res) => {
    const type = req.parama.type;
    const code = req.params.code;
}

exports.delete = async (req, res) => {

}