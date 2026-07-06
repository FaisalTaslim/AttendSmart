const Employee = require("../../models/users/employee");
const SchoolStudent = require("../../models/users/school-student");
const CollegeStudent = require("../../models/users/college-student");

function hasDescriptors(user) {
  return (
    Array.isArray(user?.faceData?.descriptors) &&
    user.faceData.descriptors.length > 0
  );
}

exports.request = async (req, res) => {
  try {
    const isUser = req.query.user;
    let users = [];

    if (isUser === "employee") {
      users = await Employee.find({}).select("code faceData");
    } else if (isUser === "student") {
      const type = req.query.type;
      const dept = req.query.dept;

      if (type === "college-student") {
        users = await CollegeStudent.find({
          dept,
        }).select("code faceData");
      } else if (type === "school-student") {
        users = await SchoolStudent.find({
          standard: dept,
        }).select("code faceData");
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid student type",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    return res.json({
      success: true,
      users: users.filter(hasDescriptors).map((user) => ({
        code: user.code,
        descriptors: user.faceData.descriptors,
      })),
    });
  } catch (err) {
    console.error("Failed to fetch face data:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch face data",
    });
  }
};
