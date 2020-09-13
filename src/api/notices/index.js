const { Router } = require('express');
const {
    getNoticeList,
    getNotice,
    recommendNotice,
    postCommentNotice,
    reviseCommentNotice,
    deleteCommentNotice,
    recommendCommentNotice,
} = require('./notices.ctrl');

const router = Router();

router.get('/page/:page', getNoticeList);
router.get('/:boardId', getNotice);
router.post('/:boardId/recommend', recommendNotice);
router.post('/:boardId/comment', postCommentNotice);
router.put('/:boardId/comment/:commentId', reviseCommentNotice);
router.delete('/:boardId/comment/:commentId', deleteCommentNotice);
router.post('/:boardId/comment/:commentId/recommend', recommendCommentNotice);

module.exports = router;
