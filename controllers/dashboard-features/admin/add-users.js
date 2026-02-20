const csv = require("csv-parser");
const bcrypt = require("bcrypt");
const { Readable } = require("stream");

const Org = require("../../../models/users/organization");
const CollegeStudent = require("../../../models/users/college-student");
const SchoolStudent = require("../../../models/users/school-student");
const OrgLog = require("../../../models/statistics/logs");

const generateCode = require("../../../utils/functions/codes");

exports.uploadStudents = async (req, res) => {
    try {

        // ✅ Make sure file exists
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const orgCode = req.session.user.code;

        const org = await Org.findOne({ code: orgCode });
        if (!org) return res.status(404).json({ message: "Organization not found" });

        const orgType = org.type;

        if (orgType === "corporate") {
            return res.status(400).json({ message: "Corporate org cannot register students" });
        }

        const StudentModel =
            orgType === "college" ? CollegeStudent : SchoolStudent;

        const results = [];

        // ✅ Convert buffer to readable stream
        const stream = Readable.from(req.file.buffer.toString());

        stream
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", async () => {

                let insertedCount = 0;
                let skippedCount = 0;

                for (const row of results) {

                    const email = row.email?.toLowerCase().trim();
                    const roll = row["roll_no"] || row["roll no"];

                    const existingStudent = await StudentModel.findOne({
                        $or: [
                            { email: email },
                            { roll: roll }
                        ]
                    });

                    if (existingStudent) {
                        skippedCount++;
                        continue;
                    }

                    const firstName = row.name.split(" ")[0];
                    const defaultPassword = `${firstName}123`;
                    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

                    const studentData = {
                        org: orgCode,
                        code: generateCode(6, "numeric"),
                        name: row.name.trim(),
                        roll: roll,
                        contact: row.contact,
                        email: email,
                        password: hashedPassword,
                        subjects: []
                    };

                    if (orgType === "college") {
                        studentData.dept = row["dept_class"] || row["dept/class"];
                    } else {
                        studentData.standard = row["dept_class"] || row["dept/class"];
                        studentData.stream = "neutral";
                    }

                    const newStudent = await StudentModel.create(studentData);

                    await OrgLog.updateOne(
                        { org: orgCode },
                        {
                            $push: {
                                register: {
                                    name: newStudent.name,
                                    role: "student",
                                    id: newStudent.code,
                                    email: newStudent.email
                                }
                            }
                        },
                        { upsert: true }
                    );

                    insertedCount++;
                }

                req.session.popupMessage = `Upload completed! Inserted: ${insertedCount}, skipped: ${skippedCount}`;
                req.session.popupType = "success";

                res.redirect("/dashboard/admin");
            });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};