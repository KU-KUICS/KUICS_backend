const Joi = require('@hapi/joi');
const { intros } = require('../../models');

const titleScheme = Joi.string().min(3).required();
const contentSheme = Joi.array().items(Joi.string()).required();
const IntroScheme = Joi.object({
    title: titleScheme,
    content: contentSheme,
});

/**
 * 소개글 작성
 * @typedef Intro
 * @property {string} title.required - 제목
 * @property {string} content.required - 내용
 */

/**
 * 소개글 작성
 * @route POST /api/admin/intro
 * @group Admin
 * @param {Intro.model} intro.body.required - 소개 글
 * @returns {object} 200 - 빈 객체
 * @returns {Error} NOT_ADMIN - NOT_ADMIN
 * @returns {Error} INVALID_PARAMETERS - INVALID_PARAMETERS
 */
const postIntro = async (req, res, next) => {
    try {
        // TODO: 어드민 체크 로직
        console.log(req.body);
        const { error, value } = IntroScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { title, content } = value;

        await intros.create({ title, content });

        res.json({});
    } catch (err) {
        next(err);
    }
};

module.exports = {
    postIntro,
};
