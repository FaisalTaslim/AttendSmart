const mongoose = require("mongoose");
const { Schema } = mongoose;

const activeStudentSession = new Schema(
  {
    org: {
      type: String,
      required: true,
    },
    code: { type: String, required: true },
    sessionCode: {
      type: String,
      required: true,
      unique: true,
    },
    instigator: { type: String, required: true },
    subject: {
      type: String,
    },
    department: { type: String, required: true },
    joined: [
      {
        code: String,
        name: String,
        sessionKey: String,
        scannedAt: {
          type: Date,
          default: Date.now,
        },
        _id: false,
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "activeStudentSession",
  activeStudentSession,
  "activeStudentSession",
);
