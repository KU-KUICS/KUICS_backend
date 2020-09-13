const { Router } = require('express');
const { isAuthenticated } = require('../auth/passport');
const {
    getUser,
    postUser,
    updateUserPermission,
    deleteUser,
    postNotice,
    reviseNotice,
    deleteNotice,
    postIntro,
    updateIntro,
    deleteIntro,
} = require('./admin.ctrl');

const router = Router();

router.get('/user', isAuthenticated, getUser); // 사용자 리스트
router.post('/user', isAuthenticated, postUser); // 사용자 추가
router.put('/user/permission', isAuthenticated, updateUserPermission); // 사용자 등급 변경
router.delete('/user/:userId', isAuthenticated, deleteUser); // 사용자 삭제

router.post('/notice', postNotice); // 공지 작성
router.put('/notice/:boardId', reviseNotice); // 공지 수정
router.delete('/notice/:boardId', deleteNotice); // 공지 삭제

router.post('/intro', isAuthenticated, postIntro);
router.put('/intro/:introId', isAuthenticated, updateIntro);
router.delete('/intro/:introId', isAuthenticated, deleteIntro);

module.exports = router;
