function lowercase(obj) {
    const result = {};

    for (const key in obj) {
        const value = obj[key];

        if (typeof value === "string") {
            result[key] = value.trim().toLowerCase();
        } else {
            result[key] = value;
        }
    }

    return result;
}

module.exports = lowercase;