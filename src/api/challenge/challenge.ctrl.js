const Joi = require('@hapi/joi');
const { Op } = require('sequelize');
const { users, challenges, solvers } = require('../../models');

/* 검증 스키마 */
const numberSchema = Joi.number();

const flagSubmitSchema = Joi.object({
    challNo: numberSchema.required(),
    flag: Joi.string()
        .pattern(/^KUICS\{\w+\}$/) // 임시 플래그 포맷
        .required(),
});

const isMember = async (email) => {
    const member = await users.findOne({
        where: { email, state: 0, level: { [Op.gte]: 1 } },
        attributes: ['userNo'],
    });
    return member;
};

const getChallenges = async (req, res, next) => {
    try {
        const checkMember = await isMember(req.user.emails[0].value);
        if (!checkMember) throw new Error('NOT_KUICS');

        const challengeList = await challenges.findAll({
            attributes: ['challNo', 'category', 'score', 'title'],
        });

        res.json({ challengeList });
    } catch (err) {
        next(err);
    }
};

const getChallengesDesc = async (req, res, next) => {
    try {
        const checkMember = await isMember(req.user.emails[0].value);
        if (!checkMember) throw new Error('NOT_KUICS');

        const { error, value } = numberSchema.validate(req.params.challNo);
        if (error) throw new Error('INVALID_PARAMETERS');

        const challenge = await challenges.findOne({
            where: { challNo: value },
            attributes: {
                exclude: ['challNo', 'createdAt', 'updatedAt', 'flag'],
            },
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
        if (!checkMember) throw new Error('NOT_KUICS');

        const { error, value } = flagSubmitSchema.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { challNo, flag } = value;
        const challenge = await challenges.findOne({
            where: { challNo },
            attributes: ['challNo', 'flag', 'solvers'],
        });
        if (!challenge) throw new Error('INVALID_PARAMETERS');

        if (flag !== challenge.flag) throw new Error('INVALID_PARAMETERS');

        if (challenge.solvers === 0) {
            challenge.userUserNo = checkMember.userNo;
        }

        challenge.solvers += 1;
        await challenge.save();
        await solvers.create({
            userUserNo: checkMember.userNo,
            challengeChallNo: challNo,
        });

        res.json({});
    } catch (err) {
        next(err);
    }
};

module.exports = { getChallenges, getChallengesDesc, postSubmitFlag };
