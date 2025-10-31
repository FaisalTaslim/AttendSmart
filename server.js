const app = require('./app');
const os = require('os');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running locally at: http://localhost:${PORT}`);
});