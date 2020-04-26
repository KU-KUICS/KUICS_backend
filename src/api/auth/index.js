const { Router } = require('express');
const {
    login,
    logout,
    register,
    unregister,
    findId,
    findPw,
    changePw,
} = require('./auth.ctrl');

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/register', register);
router.post('/unregister', unregister);
router.post('/find/:user_id', findId);
router.post('/find/:user_pw', findPw);
router.post('/change/password', changePw);

module.exports = router;
