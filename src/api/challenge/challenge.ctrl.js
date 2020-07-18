const Joi = require('@hapi/joi');
const { Op } = require('sequelize');
const { users, challenges } = require('../../models');

/* 검증 스키마 */
const numberSchema = Joi.number();

const isMember = async (email) => {
    const member = await users.findOne({
        where: { email, level: { [Op.gte]: 1 } },
    });
    return member;
};

const getChallenges = async (req, res, next) => {
    try {
        const checkMember = await isMember(req.user.emails[0].value);
        if (!checkMember) throw new Error('NOT_KUICS');

        const challengeList = await challenges.findAll({
            attributes: ['category', 'score', 'title'],
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
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });

        res.json({ challenge });
    } catch (err) {
        next(err);
    }
};

module.exports = { getChallenges, getChallengesDesc };
