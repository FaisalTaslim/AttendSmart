const mongoose = require('mongoose');
const StudentSummary = require('../models/statistics/student-summary');

async function run() {
  try {
    await mongoose.connect('mongodb+srv://faisaltaslim79_db_user:csq70DZxQMMwBzAG@cluster0.bgldtwb.mongodb.net/AttendSmart');

    const result = await StudentSummary.deleteMany({ code: 977997 });

    console.log('Deleted documents:', result.deletedCount);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();