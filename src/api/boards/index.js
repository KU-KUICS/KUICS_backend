const { Router } = require('express');
const {
    getBoardList,
    getBoard,
    postBoard,
    reviseBoard,
    deleteBoard,
    postComment,
    reviseComment,
    deleteComment,
} = require('./boards.ctrl');

const router = Router();

router.get('/', getBoardList);
router.get('/:boardId', getBoard);
router.post('/', postBoard);
router.post('/:boardId', reviseBoard);
router.delete('/:boardId', deleteBoard);
router.post('/:boardId/comment', postComment);
router.post('/:boardId/comment/:commentId', reviseComment);
router.delete('/:boardId/comment/:commentId', deleteComment);

module.exports = router;
