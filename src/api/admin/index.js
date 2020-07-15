const { Router } = require('express');
const { postIntro } = require('./admin.ctrl');

const router = Router();

router.post('/intro', postIntro);

module.exports = router;
