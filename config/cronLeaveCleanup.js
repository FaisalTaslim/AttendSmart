const cron = require('node-cron');
const Org = require('../models/organization');
const userOnLeave = require('../models/userOnLeave');
const collegeStudent = require('../models/college-student');
const schoolStudent = require('../models/school-student');

cron.schedule('5 0 * * *', async () => {
    console.log("Running Leave cleanup job...");

    const orgs = await Org.find();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const org of orgs) {
        const orgType = org.orgType;

        if (orgType === "college") {
            const expiredCollegeLeaves = await userOnLeave.find({
                endDate: { $lt: today }
            });

            for (const leave of expiredCollegeLeaves) {
                await collegeStudent.findOneAndUpdate(
                    { uniqueId: leave.uniqueId },
                    { $set: { onLeave: false } }
                );
            }

            await userOnLeave.deleteMany({ endDate: { $lt: today }, userType: "CollegeStudent" });

        } else if (orgType === "school") {
            const expiredSchoolLeaves = await userOnLeave.find({
                endDate: { $lt: today }
            });

            for (const leave of expiredSchoolLeaves) {
                await schoolStudent.findOneAndUpdate(
                    { uniqueId: leave.uniqueId },
                    { $set: { onLeave: false } }
                );
            }
            await userOnLeave.deleteMany({ endDate: { $lt: today }, userType: "SchoolStudent" });
        }
    }

    console.log("Leave cleanup job completed.");
});
