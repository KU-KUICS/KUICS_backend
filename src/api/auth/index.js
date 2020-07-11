const { Router } = require('express');
const { getLogin, getLoginCallback, getLogout } = require('./auth.ctrl');

const router = Router();

router.get('/login', getLogin);
router.get('/login/callback', getLoginCallback);
router.get('/logout', getLogout);

module.exports = router;
