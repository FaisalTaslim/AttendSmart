const express = require('express');
const router = express.Router();
const leaveRequests = require('../../models/userLeave'); 

router.post('/:id/accept', async (req, res) => {
    try {
        await leaveRequests.findByIdAndUpdate(
            req.params.id,
            { status: 'accepted' },
            { new: true }
        );
        res.redirect('/'); 
    } catch (err) {
        console.error("Error accepting leave request:", err);
        res.status(500).send("Error accepting request");
    }
});

// Reject a leave request
router.post('/:id/reject', async (req, res) => {
    try {
        await leaveRequests.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        res.redirect('/'); 
    } catch (err) {
        console.error("Error rejecting leave request:", err);
        res.status(500).send("Error rejecting request");
    }
});

module.exports = router;