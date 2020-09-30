const chai = require('chai');

const { equal, isObject, isArray } = chai.assert;

const chaiHttp = require('chai-http');
const server = require('../src/server');

chai.use(chaiHttp);

const { challenges, solvers } = require('../src/models');

describe('challenge', async () => {
    before(async () => {
        // 데이터베이스 초기화
        await solvers.destroy({
            where: {},
            truncate: true,
            restartIdentity: true,
            force: true,
            cascade: true,
        });
        await challenges.destroy({
            where: {},
            truncate: true,
            restartIdentity: true,
            force: true,
            cascade: true,
        });
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
                    '3507CE1728D2A7870235D14902EE62E387060E5DB2FCF3D17334F936354BB522', // KUICS{WEB}
                score: 1000,
            });
        });

        it('returns all challenge info', async () => {
            const res = await chai.request(server).get('/api/challenge/');
            const resObj = JSON.parse(res.text);

            equal(res.status, 200);
            equal(Object.keys(resObj.challList).length, 5);
            equal(Object.keys(resObj.challList.PWN).length, 2);
            equal(Object.keys(resObj.challList.WEB).length, 1);
        });

        it('returns challenge info with given category(valid)', async () => {
            const res = await chai
                .request(server)
                .get('/api/challenge/')
                .send({ category: 'PWN' });
            const resObj = JSON.parse(res.text);

            equal(res.status, 200);
            isArray(resObj.challList);
            equal(resObj.challList.length, 2);
        });

        it('returns challenge info with given category(invalid)', async () => {
            const res = await chai
                .request(server)
                .get('/api/challenge/')
                .send({ category: 'FooBar' });
            const resObj = JSON.parse(res.text);

            equal(res.status, 404);
            equal(resObj.errorCode, 1);
        });

        it('returns challenge info of given challId(valid)', async () => {
            const res = await chai.request(server).get('/api/challenge/1');
            const resObj = JSON.parse(res.text);

            equal(res.status, 200);
            isObject(resObj.challenge);
        });

        it('returns challenge info of invalid challId(positive number)', async () => {
            const res = await chai.request(server).get('/api/challenge/4');
            const resObj = JSON.parse(res.text);

            equal(res.status, 404);
            equal(resObj.errorCode, 1);
        });

        it('returns challenge info of invalid challId(negative number)', async () => {
            const res = await chai.request(server).get('/api/challenge/-1');
            const resObj = JSON.parse(res.text);

            equal(res.status, 404);
            equal(resObj.errorCode, 1);
        });

        it('returns challenge info of invalid challId(string)', async () => {
            const res = await chai.request(server).get('/api/challenge/FooBar');
            const resObj = JSON.parse(res.text);

            equal(res.status, 404);
            equal(resObj.errorCode, 1);
        });
    });

    // 문제 플래그 인증
    describe('POST /', async () => {});

    // 문제 파일 다운로드
    describe('GET /attachments/:challId', async () => {});
});
