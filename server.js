const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

(async () => {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running locally at: http://localhost:${PORT}`);
    });
})().catch((err) => {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
});
