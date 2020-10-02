const chai = require('chai');

const { equal, isObject, isArray } = chai.assert;

const chaiHttp = require('chai-http');
const server = require('../src/server');

chai.use(chaiHttp);

const { users, challenges, solvers } = require('../src/models');

describe('challenge', async () => {
    before(async () => {
        // 데이터베이스 초기화
        await users.destroy({
            where: {},
            truncate: true,
            restartIdentity: true,
            force: true,
            cascade: true,
        });
        await users.create({
            userName: 'admin',
            email: 'test@kuics.kro.kr',
            studentId: '2020123456',
            joinedAt: new Date(Date.now()),
            level: '999',
            state: '0',
        });
        await users.create({
            userName: 'Hello',
            email: 'hello@foo.com',
            studentId: '2020123123',
            joinedAt: new Date(Date.now()),
            level: '1',
            state: '0',
        });
        await users.create({
            userName: 'World',
            email: 'world@bar.com',
            joinedAt: new Date(Date.now()),
            studentId: '2020456456',
            level: '1',
            state: '0',
        });

        await challenges.destroy({
            where: {},
            truncate: true,
            restartIdentity: true,
            force: true,
            cascade: true,
        });
        await challenges.create({
            category: 'PWN',
            title: 'PWN1',
            description: 'PWN1',
            flag:
                'B94E1088528150F7A87D035C2BFD1CC3DFC40C6A85CBBD663FF9C55C0B3D7783', // KUICS{PWN}
            score: 1000,
            solvers: 1,
            userUserId: 2,
        });
        await challenges.create({
            category: 'PWN',
            title: 'PWN2',
            description: 'PWN2',
            flag:
                'B94E1088528150F7A87D035C2BFD1CC3DFC40C6A85CBBD663FF9C55C0B3D7783', // KUICS{PWN}
            score: 1000,
            solvers: 1,
            userUserId: 2,
        });
        await challenges.create({
            category: 'WEB',
            title: 'WEB1',
            description: 'WEB1',
            flag:
                '3507CE1728D2A7870235D14902EE62E387060E5DB2FCF3D17334F936354BB522', // KUICS{WEB}
            score: 1000,
            solvers: 1,
            userUserId: 3,
        });

        await solvers.destroy({
            where: {},
            truncate: true,
            restartIdentity: true,
            force: true,
            cascade: true,
        });
        await solvers.create({
            userUserId: 2,
            challengeChallId: 1,
        });
        await solvers.create({
            userUserId: 2,
            challengeChallId: 2,
        });
        await solvers.create({
            userUserId: 3,
            challengeChallId: 3,
        });
    });

    // 스코어 보드
    describe('GET /scoreboard', async () => {
        it('returns scoreboard', async () => {
            const res = await chai
                .request(server)
                .get('/api/challenge/scoreboard');
            const resObj = JSON.parse(res.text);

            equal(res.status, 200);
            isArray(resObj.scoreboard);
            equal(resObj.scoreboard.length, 2);
            equal(resObj.scoreboard[0].userUserId, 2);
            equal(resObj.scoreboard[0].score, 2000);
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.scoreboard[0],
                    'lastSubmit',
                ),
                true,
            );
            equal(resObj.scoreboard[0]['user.userName'], 'Hello');
            equal(resObj.scoreboard[1].userUserId, 3);
            equal(resObj.scoreboard[1].score, 1000);
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.scoreboard[1],
                    'lastSubmit',
                ),
                true,
            );
            equal(resObj.scoreboard[1]['user.userName'], 'World');
        });
    });

    // 유저 스코어 상세
    describe('GET /scoreboard/:userId', async () => {
        it('returns scoreboard of valid user', async () => {
            const res = await chai
                .request(server)
                .get('/api/challenge/scoreboard/2');
            const resObj = JSON.parse(res.text);

            equal(res.status, 200);
            equal(resObj.userId, 2);
            equal(resObj.userName, 'Hello');
            isArray(resObj.scoreboard);
            equal(resObj.scoreboard.length, 2);

            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.scoreboard[0],
                    'submitted',
                ),
                true,
            );
            equal(resObj.scoreboard[0].challenge.title, 'PWN1');
            equal(resObj.scoreboard[0].challenge.score, 1000);
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.scoreboard[1],
                    'submitted',
                ),
                true,
            );
            equal(resObj.scoreboard[1].challenge.title, 'PWN2');
            equal(resObj.scoreboard[1].challenge.score, 1000);
        });

        it('returns scoreboard of invalid user(positive)', async () => {
            const res = await chai
                .request(server)
                .get('/api/challenge/scoreboard/10');
            const resObj = JSON.parse(res.text);

            equal(res.status, 404);
            equal(resObj.errorCode, 1);
        });

        it('returns scoreboard of invalid user(negative)', async () => {
            const res = await chai
                .request(server)
                .get('/api/challenge/scoreboard/-1');
            const resObj = JSON.parse(res.text);

            equal(res.status, 404);
            equal(resObj.errorCode, 1);
        });

        it('returns scoreboard of invalid user(string)', async () => {
            const res = await chai
                .request(server)
                .get('/api/challenge/scoreboard/hello');
            const resObj = JSON.parse(res.text);

            equal(res.status, 404);
            equal(resObj.errorCode, 1);
        });
    });

    // 문제 목록 불러오기
    describe('GET /', async () => {
        it('returns all challenge info', async () => {
            const res = await chai.request(server).get('/api/challenge/');
            const resObj = JSON.parse(res.text);

            equal(res.status, 200);
            equal(Object.keys(resObj.challList).length, 5);
            equal(Object.keys(resObj.challList.PWN).length, 2);
            equal(Object.keys(resObj.challList.WEB).length, 1);
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challList.PWN[0],
                    'challId',
                ),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challList.PWN[0],
                    'category',
                ),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challList.PWN[0],
                    'score',
                ),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challList.PWN[0],
                    'title',
                ),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challList.PWN[0],
                    'score',
                ),
                true,
            );
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
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challList[0],
                    'challId',
                ),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challList[0],
                    'category',
                ),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challList[0],
                    'score',
                ),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challList[0],
                    'title',
                ),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challList[0],
                    'score',
                ),
                true,
            );
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
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challenge,
                    'challId',
                ),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challenge,
                    'category',
                ),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(resObj.challenge, 'score'),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(resObj.challenge, 'title'),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challenge,
                    'description',
                ),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challenge,
                    'solvers',
                ),
                true,
            );
            equal(
                Object.prototype.hasOwnProperty.call(
                    resObj.challenge,
                    'firstBlood',
                ),
                true,
            );
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
    describe('POST /', async () => {
        before(async () => {
            await solvers.destroy({
                where: {},
                truncate: true,
                restartIdentity: true,
                force: true,
                cascade: true,
            });
            await challenges.update(
                { solvers: 0, userUserId: null },
                { where: {} },
            );
        });

        it('submit valid flag', async () => {
            const res = await chai
                .request(server)
                .post('/api/challenge')
                .send({ challId: 1, flag: 'KUICS{PWN}' });
            const chall = await challenges.findOne({ where: { challId: 1 } });

            equal(res.status, 200);
            equal(chall.userUserId, 1); // 퍼스트 블러드
        });

        it('submit already submitted flag', async () => {
            const res = await chai
                .request(server)
                .post('/api/challenge')
                .send({ challId: 1, flag: 'KUICS{PWN}' });
            const resObj = JSON.parse(res.text);

            equal(res.status, 403);
            equal(resObj.errorCode, 5);
        });

        it('submit invalid flag(invalid format)', async () => {
            const res = await chai
                .request(server)
                .post('/api/challenge')
                .send({ challId: 2, flag: 'FooBar' });
            const resObj = JSON.parse(res.text);

            equal(res.status, 404);
            equal(resObj.errorCode, 1);
        });

        it('submit invalid flag(wrong flag)', async () => {
            const res = await chai
                .request(server)
                .post('/api/challenge')
                .send({ challId: 2, flag: 'KUICS{FooPWN}' });
            const resObj = JSON.parse(res.text);

            equal(res.status, 404);
            equal(resObj.errorCode, 1);
        });
    });

    // 문제 파일 다운로드
    describe('GET /attachments/:challId', async () => {
        before(async () => {
            await challenges.destroy({
                where: {},
                truncate: true,
                restartIdentity: true,
                force: true,
                cascade: true,
            });
            await solvers.destroy({
                where: {},
                truncate: true,
                restartIdentity: true,
                force: true,
                cascade: true,
            });
            await challenges.create({
                category: 'PWN',
                title: 'PWN1',
                description: 'PWN1',
                flag:
                    'B94E1088528150F7A87D035C2BFD1CC3DFC40C6A85CBBD663FF9C55C0B3D7783', // KUICS{PWN}
                score: 1000,
                solvers: 1,
                userUserId: 2,
            });
        });

        it('download attachment(valid challId)', async () => {});
        it('download attachment(invalid challId, positive)', async () => {});
        it('download attachment(invalid challId, negative)', async () => {});
        it('download attachment(invalid challId, string)', async () => {});
    });
});
