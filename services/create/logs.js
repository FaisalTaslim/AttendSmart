const RegisterLog = require("../../models/logs/register");

async function registerLog(data, session) {
    if (typeof data !== "object" || data === null) {
        throw new Error("Invalid data sent!");
    }

    return RegisterLog.create([data], { session });
}

module.exports = { registerLog };