const mongoose = require("mongoose");
const csv = require("csv-parser");
const { Readable } = require("stream");
const Org = require("../../models/users/organization");
const Schedule = require("../../models/schedule/schedule");
const {VALID_DAYS, DAY_KEY_BY_LOWER, isValidTime,} = require("../../utils/csv-uploads-utils");

exports.request = async (req, res) => {
  console.log("hitting the schedule route");
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

    const seenDays = new Set();
    const week = {};
    let scheduleGrace;

    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv({ mapHeaders: ({ header }) => header.toLowerCase().trim() }))
        .on("data", (row) => {
          try {
            const rawDay = row.day?.trim();
            const day =
              rawDay && DAY_KEY_BY_LOWER[String(rawDay).toLowerCase()];

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

            if (scheduleGrace === undefined) {
              scheduleGrace = grace;
            } else if (scheduleGrace !== grace) {
              throw new Error(
                `Grace must be the same for every row (found ${scheduleGrace} and ${grace})`,
              );
            }

            week[day] = {
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
            };
          } catch (err) {
            reject(err);
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const missingDays = Object.values(DAY_KEY_BY_LOWER).filter(
      (d) => !seenDays.has(d),
    );
    if (missingDays.length) {
      throw new Error(`Missing schedule rows for: ${missingDays.join(", ")}`);
    }

    if (scheduleGrace === undefined) {
      throw new Error("Grace is required");
    }

    await Schedule.findOneAndUpdate(
      { org: orgCode },
      {
        $set: {
          org: orgCode,
          week,
          grace: scheduleGrace,
        },
      },
      {
        upsert: true,
        new: true,
        session,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    const org = await Org.findOneAndUpdate(
      { code: orgCode },
      {
        $set: {
          "setup.scheduleUploaded": true,
        },
      },
      { new: true, session },
    );

    if (
      org.type !== "corporate" &&
      org.setup.subjectsUploaded &&
      org.setup.scheduleUploaded
    ) {
      await Org.updateOne(
        { code: orgCode },
        { $set: { "setup.done": true } },
        { session },
      );
    } else if (org.type === "corporate" && org.setup.scheduleUploaded) {
      await Org.updateOne(
        { code: orgCode },
        { $set: { "setup.done": true } },
        { session },
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
