const QRCode = require('qrcode');
const generateCode = require('../public/js/global/generate-code-for-qr');

async function generateEmployeeQR(sessionInstigator) {
    const employeeCode = generateCode(8);

    const qrData = JSON.stringify({
        employeeCode,
        sessionInstigator
    });

    try {
        const qrImage = await QRCode.toDataURL(qrData);
        return { employeeCode, qrImage };
    } catch (err) {
        console.error("QR generation failed:", err);
        throw err;
    }
}

module.exports = generateEmployeeQR;
