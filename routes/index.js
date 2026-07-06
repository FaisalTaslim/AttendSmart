module.exports = {
    registration: {
        admin: require('../controlllers/registration/admin.js'),
        employee: require('../controlllers/registration/employee.js'),
        student: require('../controlllers/registration/student.js'),
    },
    verify: {
        account: require('../controllers/registration/verify-user.js'),
    },
    upload: {
        csv: require('../controllers/registration/upload-csv.js'),
    },
    fetch: {
        orgList: require('../controllers/registration/fetch-org-list.js'),
    }
}