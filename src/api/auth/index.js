const { Router } = require('express');
const {
    getLoginGoogle,
    googleAuth,
    getLoginGoogleCallback,
    testCb,
    getLogout,
} = require('./auth.ctrl');
const { isAuthenticated } = require('./passport');

const router = Router();

router.get('/login/google', getLoginGoogle);
router.get('/login/google/callback', googleAuth, getLoginGoogleCallback);
router.get('/testroute', isAuthenticated, testCb);
router.get('/logout', getLogout);

module.exports = router;