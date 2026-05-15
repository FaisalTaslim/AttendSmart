const CollegeStudent = require('../../../models/users/college-student');

exports.display = async (req, res) => {
    const studentCode = req.session.user.code;
    const studentsData = await CollegeStudent.findOne({code: studentCode});
    const isFaceUploaded = studentsData.setup.faceUploaded;

    res.render('dashboards/college-student',
        {
            popupMessage: null,
            popupType: null,
            isFaceUploaded,
        }
    );
}