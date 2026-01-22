const Org = require('../../models/users/organization')

exports.homepage = async (req, res) => {
    res.render('index', {
        popupMessage: null,
        popupType: null
    });
}

exports.guidebook = async (req, res) => {
    res.render('guidebook')
}

exports.orgList = async (req, res) => {
    try {
        const orgs = await Org.find(
            { isDeleted: false, setup_done: true },
            {
                org: 1,
                branch: 1,
                code: 1,
                subjects: 1,
                _id: 0
            }
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