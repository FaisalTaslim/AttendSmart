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

const scheduleSchema = new Schema({
    org: { type: String, required: true, unique: true },

    week: {
        Monday: {
            day: shiftSchema,
            night: shiftSchema,
        },
        Tuesday: {
            day: shiftSchema,
            night: shiftSchema,
        },
        Wednesday: {
            day: shiftSchema,
            night: shiftSchema,
        },
        Thursday: {
            day: shiftSchema,
            night: shiftSchema,
        },
        Friday: {
            day: shiftSchema,
            night: shiftSchema,
        },
        Saturday: {
            day: shiftSchema,
            night: shiftSchema,
        },
        Sunday: {
            day: shiftSchema,
            night: shiftSchema,
        },
    },

    grace: {
        type: Number,
        min: 0,
        max: 60,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);
