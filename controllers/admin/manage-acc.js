/* For new admin dashboard */

const org = require('../../models/Org');

exports.fetchDetails = async(req, res) => {
    const userId = req.session.user.uniqueId;
    const details = await org.findOne({uniqueId: userId});
}