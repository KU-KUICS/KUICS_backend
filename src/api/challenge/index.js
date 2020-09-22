const { Router } = require('express');
const {
    getChallenges,
    getChallengesDesc,
    postSubmitFlag,
    getScoreboard,
} = require('./challenge.ctrl');

const router = Router();

router.get('/scoreboard', getScoreboard); // 스코어 보드
router.get('/', getChallenges); // 문제 목록 불러오기
router.get('/:challNo', getChallengesDesc); // 문제 설명 불러오기
router.post('/', postSubmitFlag); // 문제 플래그 인증

module.exports = router;
