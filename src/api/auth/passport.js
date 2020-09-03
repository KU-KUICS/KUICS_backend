const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { users } = require('../../models');

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

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
                /* TODO: 나중에 product 서버로 바꾸기 */
                'http://test.kuics.kro.kr:4000/api/auth/login/callback',
            scope: ['profile', 'email'],
        },
        (accessToken, refreshToken, profile, cb) => {
            return cb(null, profile);
        },
    ),
);

const isAuthenticated = async (req, res, next) => {
    try {
        if (!req.user) throw new Error('NO_LOGIN');

        const email = req.user.emails[0].value;
        const isMember = await users.findOne({
            where: { email },
        });

        if (!isMember) {
            throw new Error('NO_AUTH');
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
};

module.exports = {
    passport,
    isAuthenticated,
};
