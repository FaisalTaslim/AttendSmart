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