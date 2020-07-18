const { Router } = require('express');
const {
    getChallenges,
    getChallengesDesc,
    postSubmitFlag,
} = require('./challenge.ctrl');

const router = Router();

/* TODO: isAuthenticated 추가 */
router.get('/', getChallenges); // 문제 목록 불러오기
router.get('/:challNo', getChallengesDesc); // 문제 설명 불러오기
router.post('/', postSubmitFlag); // 문제 플래그 인증

// TODO:
// - 랭킹 출력

module.exports = router;
