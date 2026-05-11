const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("🔍 Connecting to DB...");
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not set");
        }

        mongoose.set('bufferCommands', false);

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });
        console.log("✅ MongoDB Connected Successfully!");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
