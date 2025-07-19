function checkRole(allowedRoles = []) {
    return function (req, res, next) {
        const user = req.session.user;

        if (!user) {
            return res.status(401).send('Not logged in');
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).send('Access denied: You are not allowed here 😎');
        }

        next();
    };
}

module.exports = checkRole;
