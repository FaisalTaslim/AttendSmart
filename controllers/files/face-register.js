const resolveUserModel = require('../../utils/functions/resolveUserModel');

exports.registerFace = async (req, res) => {
    try {
        const user = req.session.user;

        if (!user || !user.code || !user.role) 
            return res.status(401).json({ error: "Unauthorized" });

        const Model = resolveUserModel(user.role);

        if (!Model) {
            return res.status(400).json({ error: "Unsupported user role" });
        }

        const { descriptor } = req.body;

        if (!Array.isArray(descriptor)) return res.status(400).json({ error: "Invalid face descriptor format" });
        if (descriptor.length !== 128) return res.status(400).json({ error: "Face descriptor must be 128 values" });
        if (!descriptor.every(n => typeof n === "number")) return res.status(400).json({ error: "Face descriptor contains invalid values" });
        

        await Model.updateOne(
            { code: user.code },
            {
                $push: {
                    "faceData.descriptors": {
                        $each: [descriptor],
                        $slice: -5
                    }
                },
                $set: { "setup.faceUploaded": true }
            }
        );


        return res.json({
            success: true,
            message: "Face registered successfully"
        });

    } catch (err) {
        console.error("❌ Face register error:", err);
        return res.status(500).json({ error: "Face registration failed" });
    }
};
