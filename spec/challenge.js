const chai = require('chai');

const { equal } = chai.assert;

const chaiHttp = require('chai-http');
const server = require('../src/server');

chai.use(chaiHttp);

const { challenges, solvers } = require('../src/models');

describe('challenge', async () => {
    before(async () => {
        // Clear database
        await challenges.destroy({ where: {}, force: true });
        await solvers.destroy({ where: {}, force: true });
    });

    // 스코어 보드
    describe('GET /scoreboard', async () => {});

    // 유저 스코어 상세
    describe('GET /scoreboard/:userId', async () => {});

    // 문제 목록 불러오기
    describe('GET /', async () => {
        before(async () => {
            await challenges.create({
                category: 'PWN',
                title: 'PWN1',
                description: 'PWN1',
                flag:
                    'B94E1088528150F7A87D035C2BFD1CC3DFC40C6A85CBBD663FF9C55C0B3D7783', // KUICS{PWN}
                score: 1000,
            });
            await challenges.create({
                category: 'PWN',
                title: 'PWN2',
                description: 'PWN2',
                flag:
                    'B94E1088528150F7A87D035C2BFD1CC3DFC40C6A85CBBD663FF9C55C0B3D7783', // KUICS{PWN}
                score: 1000,
            });
            await challenges.create({
                category: 'WEB',
                title: 'WEB1',
                description: 'WEB1',
                flag:
                    '3507CE1728D2A7870235D14902EE62E387060E5DB2FCF3D17334F936354BB522', // KUICS{}
                score: 1000,
            });
        });

        it('returns all challenge info', async () => {
            const res = await chai.request(server).get('/api/challenge');
            const resObj = JSON.parse(res.text);

            equal(res.status, 200);
            equal(Object.keys(resObj.challList).length, 5);
            equal(Object.keys(resObj.challList.PWN).length, 2);
            equal(Object.keys(resObj.challList.WEB).length, 1);
        }, 1000);

        it('returns challenge info of given challId', async () => {});
        it('returns challenge info of given challId', async () => {});
    });

    // 문제 플래그 인증
    describe('POST /', async () => {});

    // 문제 파일 다운로드
    describe('GET /attachments/:challId', async () => {});
});
