const app = require('./app');
const os = require('os');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    const networkInterfaces = os.networkInterfaces();
    const addresses = [];
    for (let iface of Object.values(networkInterfaces)) {
        for (let alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal) {
                addresses.push(alias.address);
            }
        }
    }

    console.log(`🚀 Server running locally at: http://localhost:${PORT}`);
    addresses.forEach(ip => {
        console.log(`📱 Accessible on your network at: http://${ip}:${PORT}`);
    });
});