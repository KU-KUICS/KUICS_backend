const { Router } = require('express');
const { getIntro } = require('./intros.ctrl');

const router = Router();

router.get('/', getIntro);

module.exports = router;
