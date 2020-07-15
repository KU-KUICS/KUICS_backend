const { Router } = require('express');
const { postIntro, updateIntro, deleteIntro } = require('./admin.ctrl');

const router = Router();

router.post('/intro', postIntro);
router.put('/intro/:introNo', updateIntro);
router.delete('/intro/:introNo', deleteIntro);

module.exports = router;
