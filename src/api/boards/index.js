const { Router } = require('express');
const {
    getListBoard,
    getBoard,
    postBoard,
    reviseBoard,
    deleteBoard,
    recommendBoard,
    postCommentBoard,
    reviseCommentBoard,
    deleteCommentBoard,
    recommendCommentBoard,
} = require('./boards.ctrl');

const router = Router();

router.get('/page/:page', getListBoard);
router.get('/:boardId', getBoard);
router.post('/', postBoard);
router.put('/:boardId', reviseBoard);
router.delete('/:boardId', deleteBoard);
router.post('/:boardId/recommend', recommendBoard);
router.post('/:boardId/comment', postCommentBoard);
router.put('/:boardId/comment/:commentId', reviseCommentBoard);
router.delete('/:boardId/comment/:commentId', deleteCommentBoard);
router.post('/:boardId/comment/:commentId/recommend', recommendCommentBoard);

module.exports = router;
