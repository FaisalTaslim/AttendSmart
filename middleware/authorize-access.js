function authorize(...allowedRoles) {
  return (req, res, next) => {
    const user = req.session?.user;

    if (!user) {
      const params = new URLSearchParams({
        "popup-type": "error",
        "popup-message": "Access Denied! User Didn't Login!",
      });

      return res.redirect(`/?${params}`);
    }

    if (!allowedRoles.includes(user.role)) {
      const params = new URLSearchParams({
        "popup-type": "error",
        "popup-message": "Access Denied! You cannot access this route!",
      });

      return res.redirect(`/?${params}`);
    }

    next();
  };
}

module.exports = authorize;