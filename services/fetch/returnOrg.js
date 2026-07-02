const Org = require('../../models/users/organization');

async function returnOrg(obj) {
    try {
        if (typeof obj !== "object" || obj === null) {throw new Error('Invalid object sent!')};
        return Org.findOne(obj);
    }
    catch(err) {
        throw err;
    }
}

module.exports = returnOrg;