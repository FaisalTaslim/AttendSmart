const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("🔍 Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB Connected Successfully!");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;