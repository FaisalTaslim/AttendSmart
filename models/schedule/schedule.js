const mongoose = require("mongoose");
const { Schema } = mongoose;

const shiftSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["day", "night"],
            required: true,
        },
        check_in: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
        check_out: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
    },
    { _id: false }
);

const scheduleSchema = new Schema(
    {
        org: {
            type: String,
            required: true,
            index: true,
        },

        day: {
            type: String,
            enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ],
            required: true,
        },

        shifts: {
            day: {
                type: shiftSchema,
                required: true,
            },
            night: {
                type: shiftSchema,
                required: true,
            },
        },

        grace: {
            type: Number,
            required: true,
            min: 0,
            max: 60,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
