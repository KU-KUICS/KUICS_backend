const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = require('../../server');

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
} = require('../../../config/config.json');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL:
                'http://ec2-3-23-128-147.us-east-2.compute.amazonaws.com:4000/api/auth/login/google/callback',
            scope: ['profile', 'email'],
        },
        (accessToken, refreshToken, profile, cb) => {
            return cb(null, profile);
        },
    ),
);

const isAuthenticated = (req, res, next) => {
    try {
        if (!req.user) throw new Error('NO_LOGIN');


        if (!dbExists) throw new Error('NOT_KUICS');
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    passport,
    isAuthenticated,
};
