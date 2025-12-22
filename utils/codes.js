function generateCode(length = 8, type = "alphanumeric") {
    let chars = "";

    if (type === "numeric") {
        chars = "0123456789";
    } else if (type === "alphanumeric") {
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    } else {
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