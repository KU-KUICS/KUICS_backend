const crypto = require('crypto');
const { sequelize, users, challenges, solvers } = require('../../models');
const { numberScheme, flagSubmitScheme } = require('../../lib/schemes');

// TODO: 다른 API 멤버 체크 함수랑 통합
const isMember = async (email) => {
    const member = await users.findOne({
        where: { email, state: 0, level: { [sequelize.Op.gte]: 1 } },
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
                [
                    sequelize.fn('SUM', sequelize.col('challenge.score')),
                    'score',
                ],
                [
                    sequelize.fn('MAX', sequelize.col('solvers.updatedAt')),
                    'lastSubmit',
                ],
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
            order: [
                [sequelize.col('score'), 'DESC'],
                [sequelize.col('lastSubmit'), 'ASC'],
            ],
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

        const { error, value } = numberScheme.validate(req.params.userId);
        if (error) throw new Error('INVALID_PARAMETERS');

        const scoreboard = await solvers.findAll({
            attributes: ['userUserId', ['createdAt', 'submitted']],
            where: { userUserId: value },
            include: [
                {
                    model: challenges,
                    attributes: ['title', 'score'],
                    required: true,
                },
                {
                    model: users,
                    attributes: ['userName'],
                    required: true,
                },
            ],
            order: [['createdAt', 'ASC']],
        });
        if (scoreboard.length === 0) throw new Error('INVALID_PARAMETERS');

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

        // 임계점 대비 솔버 수에 따라 점수가 조정됨
        const minScore = 50;
        const maxScore = 500;
        const solverThreshold = 5;
        challenge.solvers += 1;
        challenge.score =
            solverThreshold >= challenge.solvers
                ? Math.ceil(
                      ((minScore - maxScore) /
                          (solverThreshold * solverThreshold)) *
                          (challenge.solvers * challenge.solvers) +
                          maxScore,
                  )
                : minScore;
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
