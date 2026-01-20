exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Logout error:", err);
            return res.render("index", {
                popupMessage: "Error logging out. Please try again.",
                popupType: "error"
            });
        }

        res.clearCookie('connect.sid');

        return res.redirect('/');
    });
};
