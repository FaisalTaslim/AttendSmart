module.exports = (req, res, next) => {
    res.locals.isAuthenticated = !!req.session.user;
    res.locals.loggedUser = req.session.user || null;
    next();
};