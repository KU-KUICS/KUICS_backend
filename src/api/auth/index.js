const { Router } = require('express');
const { getAuth, postAuth } = require('./auth.ctrl');

const router = Router();

router.get('/:user_id', getAuth);
router.post('/', postAuth);

module.exports = router;
