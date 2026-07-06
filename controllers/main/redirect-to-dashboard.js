exports.display = (req, res) => {
  const redirect = {
    admin: '/app/admin',
    "school-student": '/app/school-student',
    "college-student": '/app/college-student',
    corporate: '/app/employee/corporate',
    teacher: '/app//employee/teacher',
  };

  let targetRoute;

  if (req.session.user.role !== 'employee') {
    targetRoute = redirect[req.session.user.role];
  } else {
    targetRoute = redirect[req.session.user.employeeType];
  }

  if (!targetRoute) {
    return res.render('index', {
      popupMessage: 'Invalid role detected',
      popupType: 'error',
    });
  }

  return res.redirect(targetRoute);
};