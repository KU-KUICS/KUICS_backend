const { Router } = require('express');
const {
    getBoardExcerpt,
    getBoard,
    postBoard,
    reviseBoard,
    deleteBoard,
    recommendBoard,
    postComment,
    reviseComment,
    deleteComment,
    recommendComment,
    test,
} = require('./boards.ctrl');

const router = Router();

router.get('/:userId', test);
router.get('/', getBoardExcerpt);
router.get('/:boardId', getBoard);
router.post('/', postBoard);
router.put('/:boardId', reviseBoard);
router.delete('/:boardId', deleteBoard);
router.post('/:boardId/recommend', recommendBoard);
router.post('/:boardId/comment', postComment);
router.put('/:boardId/comment/:commentId', reviseComment);
router.delete('/:boardId/comment/:commentId', deleteComment);
router.post('/:boardId/comment/:commentId/recommend', recommendComment);

module.exports = router;
