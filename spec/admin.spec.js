const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const chai = require('chai');

const { equal } = chai.assert;

const chaiHttp = require('chai-http');
const server = require('../src/server');

chai.use(chaiHttp);

const { users, challenges, solvers, attachedFile } = require('../src/models');

describe('admin', async () => {
    describe('Challenge related APIs', async () => {
        before(async () => {
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
        });

        describe('POST /challenge', async () => {
            before(async () => {
                fs.writeFileSync('test.dat', 'helloworld');
            });

            it('create a new challenge', async () => {
                const res = await chai
                    .request(server)
                    .post('/api/admin/challenge')
                    .field('category', 'PWN')
                    .field('title', 'PWN!')
                    .field('description', 'PWN!!')
                    .field('flag', 'KUICS{PWNflag}')
                    .attach(
                        'attachment',
                        fs.readFileSync('test.dat'),
                        'test.dat',
                    );
                const challenge = await challenges.findOne({
                    where: { challId: 1 },
                });
                const flagHash = crypto
                    .createHash('sha256')
                    .update('KUICS{PWNflag}')
                    .digest('hex')
                    .toUpperCase();
                const attachment = await attachedFile.findOne({
                    where: { challengeChallId: 1 },
                });
                const attachmentHash = crypto
                    .createHash('sha256')
                    .update('helloworld')
                    .digest('hex');
                equal(res.status, 200);
                equal(challenge.category, 'PWN');
                equal(challenge.title, 'PWN!');
                equal(challenge.description, 'PWN!!');
                equal(challenge.flag, flagHash);
                equal(attachment.fileName, `test_${attachmentHash}.dat`);
            });

            it('invalid category value', async () => {
                const res = await chai
                    .request(server)
                    .post('/api/admin/challenge')
                    .field('category', 'FAKE_CATEGORY')
                    .field('title', 'PWN!')
                    .field('description', 'PWN!!')
                    .field('flag', 'KUICS{PWNflag}')
                    .attach(
                        'attachment',
                        fs.readFileSync('test.dat'),
                        'test.dat',
                    );
                const resObj = JSON.parse(res.text);
                equal(res.status, 404);
                equal(resObj.errorCode, 1);
            });

            it('invalid flag format', async () => {
                const res = await chai
                    .request(server)
                    .post('/api/admin/challenge')
                    .field('category', 'FAKE_CATEGORY')
                    .field('title', 'PWN!')
                    .field('description', 'PWN!!')
                    .field('flag', 'FAKEFLAG{flag}')
                    .attach(
                        'attachment',
                        fs.readFileSync('test.dat'),
                        'test.dat',
                    );
                const resObj = JSON.parse(res.text);
                equal(res.status, 404);
                equal(resObj.errorCode, 1);
            });
            after(async () => {
                fs.unlinkSync('test.dat');
            });
        });

        describe('PUT /challenge/:challId', async () => {
            before(async () => {
                fs.writeFileSync('test2.dat', 'foobar');
            });

            it('create a new challenge', async () => {
                const res = await chai
                    .request(server)
                    .put('/api/admin/challenge/1')
                    .field('category', 'PWN')
                    .field('title', 'PWN_EDIT!')
                    .field('description', 'PWN_EDIT!!')
                    .field('flag', 'KUICS{PWNflag}')
                    .attach(
                        'attachment',
                        fs.readFileSync('test2.dat'),
                        'test2.dat',
                    );
                const challenge = await challenges.findOne({
                    where: { challId: 1 },
                });
                const flagHash = crypto
                    .createHash('sha256')
                    .update('KUICS{PWNflag}')
                    .digest('hex')
                    .toUpperCase();
                const attachment = await attachedFile.findOne({
                    where: { challengeChallId: 1 },
                });
                const attachmentHash = crypto
                    .createHash('sha256')
                    .update('foobar')
                    .digest('hex');
                equal(res.status, 200);
                equal(challenge.category, 'PWN');
                equal(challenge.title, 'PWN_EDIT!');
                equal(challenge.description, 'PWN_EDIT!!');
                equal(challenge.flag, flagHash);
                equal(attachment.fileName, `test2_${attachmentHash}.dat`);
            });

            it('invalid challId', async () => {
                const res = await chai
                    .request(server)
                    .put('/api/admin/challenge/100')
                    .field('category', 'FAKE_CATEGORY')
                    .field('title', 'PWN!')
                    .field('description', 'PWN!!')
                    .field('flag', 'KUICS{PWNflag}')
                    .attach(
                        'attachment',
                        fs.readFileSync('test2.dat'),
                        'test2.dat',
                    );
                const resObj = JSON.parse(res.text);
                equal(res.status, 404);
                equal(resObj.errorCode, 1);
            });

            it('invalid category value', async () => {
                const res = await chai
                    .request(server)
                    .put('/api/admin/challenge/1')
                    .field('category', 'FAKE_CATEGORY')
                    .field('title', 'PWN!')
                    .field('description', 'PWN!!')
                    .field('flag', 'KUICS{PWNflag}')
                    .attach(
                        'attachment',
                        fs.readFileSync('test2.dat'),
                        'test2.dat',
                    );
                const resObj = JSON.parse(res.text);
                equal(res.status, 404);
                equal(resObj.errorCode, 1);
            });

            it('invalid flag format', async () => {
                const res = await chai
                    .request(server)
                    .put('/api/admin/challenge/1')
                    .field('category', 'FAKE_CATEGORY')
                    .field('title', 'PWN!')
                    .field('description', 'PWN!!')
                    .field('flag', 'FAKEFLAG{flag}')
                    .attach(
                        'attachment',
                        fs.readFileSync('test2.dat'),
                        'test2.dat',
                    );
                const resObj = JSON.parse(res.text);
                equal(res.status, 404);
                equal(resObj.errorCode, 1);
            });
            after(async () => {
                fs.unlinkSync('test2.dat');
            });
        });

        describe('DELETE /challenge/:challId', async () => {});

        after(async () => {
            await users.destroy({
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
            await solvers.destroy({
                where: {},
                truncate: true,
                restartIdentity: true,
                force: true,
                cascade: true,
            });
            await attachedFile.destroy({
                where: {},
                truncate: true,
                restartIdentity: true,
                force: true,
                cascade: true,
            });
            fs.readdir('attachment/', (err, files) => {
                for (let i = 0; i < files.length; i += 1) {
                    fs.unlinkSync(path.join('attachment/', files[i]));
                }
            });
        });
    });
});
