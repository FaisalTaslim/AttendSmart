const Org = require('../../models/users/organization')

exports.fetch = async (req, res) => {
    try {
        const orgs = await Org.find(
            {
                isDeleted: false,
                "setup.done": true
            },
        );

        res.json({
            success: true,
            organizations: orgs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};