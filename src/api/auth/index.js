const { Router } = require('express');
const {
    postLogin,
    postLogout,
    postRegister,
    postUnregister,
    findId,
    findPw,
    changePw,
} = require('./auth.ctrl');

const router = Router();

router.post('/login', postLogin);
router.post('/logout', postLogout);
router.post('/register', postRegister);
router.post('/unregister', postUnregister);
router.post('/find/:user_id', findId);
router.post('/find/:user_pw', findPw);
router.post('/change/password', changePw);

module.exports = router;
