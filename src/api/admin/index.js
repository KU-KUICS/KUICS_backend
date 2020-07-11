const { Router } = require('express');
const { getAdmin, postAdmin } = require('./admin.ctrl');

const router = Router();

router.get('/:user_id', getAdmin);
router.post('/', postAdmin);

module.exports = router;
