const express = require('express');
const router = express.Router();
const Org = require('../../models/organization');

router.post('/', async (req, res) => {
    try {
        const user = req.session.user.uniqueId;

        const {
            orgName,
            orgBranch,
            orgType,
            address,
            orgContact,
            orgEmail,
            orgWebsite,
            expectedEmployees,
            expectedStudents,
            adminName,
            adminId,
            adminEmail,
            adminContact
        } = req.body;

        const updatedOrg = await Org.findOneAndUpdate(
            { uniqueId: user },
            {
                $set: {
                    orgName,
                    orgBranch,
                    orgType,
                    address,
                    orgContact,
                    orgEmail,
                    orgWebsite,
                    expectedEmployees,
                    expectedStudents,
                    "admin.0.adminName": adminName,
                    "admin.0.adminId": adminId,
                    "admin.0.adminEmail": adminEmail,
                    "admin.0.adminContact": adminContact
                }
            },
            { new: true, runValidators: true } 
        );

        if (!updatedOrg) {
            return res.status(404).send("Organization not found");
        }

        res.redirect('/dashboard/admin'); 
    } catch (error) {
        console.error("Error updating org info:", error);
        res.status(500).send("Something went wrong while updating info.");
    }
});


module.exports = router;