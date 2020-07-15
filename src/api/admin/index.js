const { Router } = require('express');
const { postIntro, updateIntro } = require('./admin.ctrl');

const router = Router();

router.post('/intro', postIntro);
router.put('/intro/:introNo', updateIntro);

module.exports = router;
