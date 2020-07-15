const Joi = require('@hapi/joi');
const { intros } = require('../../models');

const introNoScheme = Joi.number();
const titleScheme = Joi.string().min(3).required();
const contentScheme = Joi.array().items(Joi.string()).required();
const introScheme = Joi.object({
    title: titleScheme,
    content: contentScheme,
});

const updateIntroScheme = Joi.object({
    introNo: introNoScheme,
    title: titleScheme,
    content: contentScheme,
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
        const { error, value } = introScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { title, content } = value;

        await intros.create({ title, content });

        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 * 소개글 수정
 * @route PUT /api/admin/intro/{introId}
 * @group Admin
 * @param {number} introId.path.required - 수정할 소개글 ID
 * @param {Intro.model} intro.body.required - 소개글 수정
 * @returns {object} 200 - 빈 객체
 * @returns {Error} NOT_ADMIN - NOT_ADMIN
 * @returns {Error} INVALID_PARAMETERS - INVALID_PARAMETERS
 */
const updateIntro = async (req, res, next) => {
    try {
        // TODO: 어드민 체크
        const { error, value } = updateIntroScheme.validate({
            ...req.body,
            introNo: req.params.introNo,
        });
        if (error) throw new Error('INVALID_PARAMETERS');

        const { introNo, title, content } = value;

        const intro = await intros.findOne({
            where: {
                introNo,
            },
        });

        if (!intro) throw new Error('INVALID_PARAMETERS');

        intro.title = title;
        intro.content = content;

        await intro.save();

        res.json({});
    } catch (err) {
        next(err);
    }
};

module.exports = {
    postIntro,
    updateIntro,
};
