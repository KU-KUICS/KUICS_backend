const { passport } = require('./passport');

const getLoginGoogle = passport.authenticate('google', {});

const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    failureRedirect: '/login',
    successRedirect: '/api/auth/testroute',
});

const getLoginGoogleCallback = async (req, res) => {
    console.log(req.user);
    res.send(req.user);
};

const testCb = (req, res) => {
    res.send(req.user);
};

const getLogout = (req, res) => {
    req.logout();
    res.redirect('/');
};

module.exports = {
    getLoginGoogle,
    googleAuth,
    getLoginGoogleCallback,
    getLogout,
    testCb,
};
