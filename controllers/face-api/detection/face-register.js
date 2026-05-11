const resolveUserModel = require('../../../utils/functions/resolveUserModel');

exports.registerFace = async (req, res) => {
    try {
        const user = req.session.user;

        if (!user || !user.code || !user.role) 
            return res.status(401).json({ error: "Unauthorized" });

        const Model = resolveUserModel(user.role);

        if (!Model) {
            return res.status(400).json({ error: "Unsupported user role" });
        }

        const { descriptor, descriptors } = req.body;

        let descriptorList = [];

        if (Array.isArray(descriptors)) {
            descriptorList = descriptors;
        } else if (Array.isArray(descriptor)) {
            descriptorList = [descriptor];
        } else {
            return res.status(400).json({ error: "Invalid face descriptor format" });
        }

        const invalidDescriptor = descriptorList.find(d =>
            !Array.isArray(d) ||
            d.length !== 128 ||
            !d.every(n => typeof n === "number")
        );

        if (invalidDescriptor) {
            return res.status(400).json({ error: "Each face descriptor must be 128 numeric values" });
        }

        await Model.updateOne(
            { code: user.code },
            {
                $push: {
                    "faceData.descriptors": {
                        $each: descriptorList,
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
