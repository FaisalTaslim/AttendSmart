const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 60 * 60 * 2
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        httpOnly: true
    }
});

module.exports = sessionMiddleware;