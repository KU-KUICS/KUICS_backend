const { Router } = require('express');
const { getBoardList, postBoard } = require('./boards.ctrl');

const router = Router();

router.get('/', getBoardList);
router.post('/:userId', postBoard);

module.exports = router;
