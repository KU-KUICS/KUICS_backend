const { Router } = require('express');
const { getChallenges, getChallengesDesc } = require('./challenge.ctrl');

const router = Router();

/* TODO: isAuthenticated 추가 */
router.get('/', getChallenges); // 문제 목록 불러오기
router.get('/:challNo', getChallengesDesc); // 문제 목록 불러오기

// TODO:
// 1. 플래그 인증
// 2. 랭킹 출력

module.exports = router;
