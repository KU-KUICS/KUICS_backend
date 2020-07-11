const { Router } = require('express');
const { postAuth } = require('./auth.ctrl');

const router = Router();

router.post('/', postAuth);

module.exports = router;
