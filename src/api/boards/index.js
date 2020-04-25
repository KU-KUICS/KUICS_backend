const { Router } = require('express');
const { getBoard, postBoard } = require('./boards.ctrl');

const router = Router();

router.get('/:user_id', getBoard);
router.post('/', postBoard);

module.exports = router;
