const { Router } = require('express');
const { getNotice, postNotice } = require('./notice.ctrl');

const router = Router();

router.get('/:user_id', getNotice);
router.post('/', postNotice);

module.exports = router;
