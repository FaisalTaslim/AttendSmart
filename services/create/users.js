const Org = require("../../models/users/organization");

async function createOrg(data, session) {
    const [org] = await Org.create([data], { session });
    return org;
}

module.exports = { createOrg };