function generateCode(length = 8, type = "alphanumeric") {
    const mapChars = {
        numeric: "0123456789",
        alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    };

    const chars = mapChars[type];

    if (!chars) {
        throw new Error("Invalid code type. Use 'numeric' or 'alphanumeric'.");
    }

    let code = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
    }

    return code;
}

module.exports = generateCode;