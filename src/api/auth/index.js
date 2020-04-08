const { Router } = require('express');
const { getAuth } = require('./auth.ctrl');

const router = Router();

router.get('/', getAuth);

module.exports = router;
