exports.display = async (req, res) => {
  const role = req.session.user.role;

  res.render("attendance/scanner", {
    role,
    popupMessage: null,
    popupType: null,
  });
};
