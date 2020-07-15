const { passport } = require('./passport');

const getLogin = passport.authenticate('google', {});

const getLoginCallback = passport.authenticate('google', {
    scope: ['profile', 'email'],
    failureRedirect: '/api/auth/login/google/',

    /* TODO: 나중에 front 루트로 수정 */
    successRedirect: 'http://test.kuics.kro.kr',
});

const getLogout = (req, res) => {
    req.logout();

    /* TODO: 나중에 front 루트로 수정 */
    res.redirect('http://test.kuics.kro.kr');
};

module.exports = {
    getLogin,
    getLoginCallback,
    getLogout,
};
