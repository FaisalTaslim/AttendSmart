const mongoose = require("mongoose");
const csv = require("csv-parser");
const { Readable } = require("stream");
const Org = require("../../models/users/organization");

exports.uploadSubjects = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No CSV file uploaded" });
        }

        const orgCode = req.session.user.code;
        if (!orgCode) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const org = await Org.findOne({ code: orgCode }).session(session);
        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        const subjects = [];
        const seenClasses = new Set();

        const stream = Readable.from(req.file.buffer.toString());

        await new Promise((resolve, reject) => {
            stream
                .pipe(csv({ mapHeaders: ({ header }) => header.toLowerCase().trim() }))
                .on("data", row => {
                    try {
                        const cls = row.class?.trim();
                        if (!cls) throw new Error("Class column cannot be empty");

                        if (seenClasses.has(cls)) {
                            throw new Error(`Duplicate class entry found: ${cls}`);
                        }
                        seenClasses.add(cls);

                        const majors = parseSubjects(row.majors, true);
                        const optionals = parseSubjects(row.optionals);
                        const minors = parseSubjects(row.minors);

                        if (majors.length === 0) {
                            throw new Error(`Majors cannot be empty for class ${cls}`);
                        }

                        subjects.push({
                            class: cls,
                            majors,
                            optionals,
                            minors
                        });
                    } catch (err) {
                        reject(err);
                    }
                })
                .on("end", resolve)
                .on("error", reject);
        });

        // Replace existing subjects during setup
        org.subjects = subjects;
        await org.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.json({
            success: true,
            message: "Subjects uploaded successfully"
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        console.error("CSV Upload Error:", err.message);

        return res.status(400).json({
            error: err.message || "Failed to process CSV"
        });
    }
};

function parseSubjects(value, required = false) {
    if (!value) return [];

    return value
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
}
