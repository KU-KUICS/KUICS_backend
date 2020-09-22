const { Router } = require('express');
const {
    getScoreboard,
    getUserScoreboard,
    getChallenges,
    getChallengesDesc,
    postSubmitFlag,
} = require('./challenge.ctrl');

const router = Router();

router.get('/scoreboard', getScoreboard); // 스코어 보드
router.get('/scoreboard/:userId', getUserScoreboard); // 유저 스코어 상세
router.get('/', getChallenges); // 문제 목록 불러오기
router.get('/:challId', getChallengesDesc); // 문제 설명 불러오기
router.post('/', postSubmitFlag); // 문제 플래그 인증

module.exports = router;
