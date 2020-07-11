const { Router } = require('express');
<<<<<<< HEAD
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
=======
const { postAuth } = require('./auth.ctrl');

const router = Router();

router.post('/', postAuth);
>>>>>>> master

module.exports = router;
