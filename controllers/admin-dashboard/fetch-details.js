const Org = require('../../models/Org');

exports.fetchDetails = async (req, res) => {
    try {
        const systemId = req.session.user.uniqueId; 
        const fetchedData = await Org.findOne({ uniqueId: systemId });

        if (!fetchedData) {
            return res.status(404).json({ error: "Data not found" });
        }

        res.status(200).json(fetchedData);

    } catch (err) {
        console.error("Error fetching details:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
