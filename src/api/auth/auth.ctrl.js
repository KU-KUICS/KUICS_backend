const passport = require('passport');

const getLogin = passport.authenticate('google', {});
const getLoginCallback = passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/',
});

const getLogout = (req, res, next) => {};

module.exports = {
    getLogin,
    getLoginCallback,
    getLogout,
};
