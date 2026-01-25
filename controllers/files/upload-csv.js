const mongoose = require("mongoose");
const csv = require("csv-parser");
const { Readable } = require("stream");
const Org = require("../../models/users/organization");
const Schedule = require("../../models/schedule/schedule");

function parseSubjects(value, required = false) {
    if (!value) return [];

    return value
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
}

function isValidTime(time) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

let tracker = 0;

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

        org.subjects = subjects;
        await org.save({ session });

        await Org.findOneAndUpdate(
            { code: orgCode },
            {
                $set: {
                    "setup.subjectsUploaded": true,
                },
            },
            { session }
        );


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

const VALID_DAYS = new Set([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]);

exports.uploadSchedule = async (req, res) => {
    console.log("hitting the schedule route")
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No CSV file uploaded" });
        }

        const orgCode = req.session.user?.code;
        if (!orgCode) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const schedules = [];
        const seenDays = new Set();

        const stream = Readable.from(req.file.buffer.toString());

        await new Promise((resolve, reject) => {
            stream
                .pipe(csv({ mapHeaders: ({ header }) => header.toLowerCase().trim() }))
                .on("data", row => {
                    try {
                        const day = row.day?.trim();

                        if (!day || !VALID_DAYS.has(day)) {
                            throw new Error(`Invalid or missing day: ${row.day}`);
                        }

                        if (seenDays.has(day)) {
                            throw new Error(`Duplicate schedule for ${day}`);
                        }
                        seenDays.add(day);

                        const dayIn = row.day_check_in?.trim();
                        const dayOut = row.day_check_out?.trim();

                        if (!dayIn || !dayOut) {
                            throw new Error(`Day shift missing for ${day}`);
                        }

                        if (!isValidTime(dayIn) || !isValidTime(dayOut)) {
                            throw new Error(`Invalid time format on ${day}`);
                        }

                        const nightIn = row.night_check_in?.trim();
                        const nightOut = row.night_check_out?.trim();

                        if ((nightIn && !nightOut) || (!nightIn && nightOut)) {
                            throw new Error(`Incomplete night shift on ${day}`);
                        }

                        if (nightIn && (!isValidTime(nightIn) || !isValidTime(nightOut))) {
                            throw new Error(`Invalid night shift time on ${day}`);
                        }

                        const grace = Number(row.grace);
                        if (isNaN(grace) || grace < 0 || grace > 60) {
                            throw new Error(`Invalid grace value on ${day}`);
                        }

                        schedules.push({
                            org: orgCode,
                            day,
                            shifts: {
                                day: {
                                    type: "day",
                                    check_in: dayIn,
                                    check_out: dayOut,
                                },
                                night: nightIn
                                    ? {
                                        type: "night",
                                        check_in: nightIn,
                                        check_out: nightOut,
                                    }
                                    : {
                                        type: "night",
                                        check_in: "00:00",
                                        check_out: "00:00",
                                    },
                            },
                            grace,
                        });

                    } catch (err) {
                        reject(err);
                    }
                })
                .on("end", resolve)
                .on("error", reject);
        });


        await Schedule.deleteMany({ org: orgCode }).session(session);

        await Schedule.insertMany(schedules, { session });

        const org = await Org.findOneAndUpdate(
            { code: orgCode },
            {
                $set: {
                    "setup.scheduleUploaded": true,
                },
            },
            { new: true, session }
        );

        if (org.type !== 'corporate' && org.setup.subjectsUploaded && org.setup.scheduleUploaded) {
            await Org.updateOne(
                { code: orgCode },
                { $set: { "setup.done": true } },
                { session }
            );
        }
        else if (org.type === 'corporate' && org.setup.scheduleUploaded) {
            await Org.updateOne(
                { code: orgCode },
                { $set: { "setup.done": true } },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        return res.json({
            success: true,
            message: "Schedule uploaded successfully",
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        console.error("Schedule CSV Upload Error:", err.message);

        return res.status(400).json({
            error: err.message || "Failed to process schedule CSV",
        });
    }
};