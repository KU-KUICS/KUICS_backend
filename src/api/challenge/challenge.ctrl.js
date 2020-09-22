const crypto = require('crypto');
const { Op, fn, col } = require('sequelize');
const { users, challenges, solvers } = require('../../models');
const { numberScheme, flagSubmitScheme } = require('../../lib/schemes');

// TODO: 다른 API 멤버 체크 함수랑 통합
const isMember = async (email) => {
    const member = await users.findOne({
        where: { email, state: 0, level: { [Op.gte]: 1 } },
        attributes: ['userId'],
    });
    return member;
};

const getScoreboard = async (req, res, next) => {
    try {
        const checkMember = await isMember(req.user.emails[0].value);
        if (!checkMember) throw new Error('NO_AUTH');

        const scoreboard = await solvers.findAll({
            attributes: [
                'userUserId',
                [fn('SUM', col('challenge.score')), 'score'],
            ],
            include: [
                {
                    model: challenges,
                    attributes: [],
                    required: true,
                },
                {
                    model: users,
                    attributes: ['userName'],
                    required: true,
                },
            ],
            group: ['solvers.userUserId', 'user.userName'],
            raw: true,
        });

        res.json({ scoreboard });
    } catch (err) {
        next(err);
    }
};

const getUserScoreboard = async (req, res, next) => {
    try {
        const checkMember = await isMember(req.user.emails[0].value);
        if (!checkMember) throw new Error('NO_AUTH');

        const { error, value } = numberScheme.validate(req.params.userNo);
        if (error) throw new Error('INVALID_PARAMETERS');

        const scoreboard = await users.findAll({
            where: { userNo: value, state: 0 },
            attributes: [
                'userName',
                // 푼 문제 목록
            ],
        });

        res.json({ scoreboard });
    } catch (err) {
        next(err);
    }
};

const getChallenges = async (req, res, next) => {
    try {
        const checkMember = await isMember(req.user.emails[0].value);
        if (!checkMember) throw new Error('NO_AUTH');

        const challengeList = await challenges.findAll({
            attributes: ['challId', 'category', 'score', 'title', 'solvers'],
            order: [['challId', 'ASC']],
        });

        // 문제 분야별로 정렬
        const categories = ['PWN', 'REV', 'WEB', 'CRYPTO', 'MISC'];
        const challList = challengeList.reduce(
            (acc, val) => {
                acc[val.category].push(val);
                return acc;
            },
            categories.reduce((acc, val) => {
                acc[val] = [];
                return acc;
            }, {}),
        );

        res.json({ challList });
    } catch (err) {
        next(err);
    }
};

const getChallengesDesc = async (req, res, next) => {
    try {
        const checkMember = await isMember(req.user.emails[0].value);
        if (!checkMember) throw new Error('NO_AUTH');

        const { error, value } = numberScheme.validate(req.params.challId);
        if (error) throw new Error('INVALID_PARAMETERS');

        const challenge = await challenges.findOne({
            where: { challId: value },
            attributes: [
                'challId',
                'category',
                'score',
                'title',
                'description',
                'solvers',
                ['userUserId', 'firstBlood'],
            ],
        });
        if (!challenge) throw new Error('INVALID_PARAMETERS');

        res.json({ challenge });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

const postSubmitFlag = async (req, res, next) => {
    try {
        const checkMember = await isMember(req.user.emails[0].value);
        if (!checkMember) throw new Error('NO_AUTH');

        const { error, value } = flagSubmitScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { challId, flag } = value;
        const challenge = await challenges.findOne({
            where: { challId },
            attributes: ['challId', 'score', 'flag', 'solvers'],
        });
        if (!challenge) throw new Error('INVALID_PARAMETERS');

        const flagHash = crypto
            .createHash('sha256')
            .update(flag)
            .digest('hex')
            .toUpperCase();
        if (flagHash !== challenge.flag) throw new Error('INVALID_PARAMETERS');
        if (challenge.solvers === 0) {
            challenge.userUserId = checkMember.userId; // 퍼스트 블러드
        } else {
            const isSolved = await solvers.findOne({
                where: {
                    userUserId: checkMember.userId,
                    challengeChallId: challId,
                },
            });
            if (isSolved) throw new Error('ALREADY_SOLVED');
        }

        challenge.solvers += 1;
        await challenge.save();
        await solvers.create({
            userUserId: checkMember.userId,
            challengeChallId: challId,
        });

        res.json({});
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getScoreboard,
    getUserScoreboard,
    getChallenges,
    getChallengesDesc,
    postSubmitFlag,
};
