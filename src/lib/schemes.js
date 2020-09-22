const Joi = require('@hapi/joi');

/**
 * Scheme primitives
 */
const contentScheme = Joi.array().items(Joi.string()).required();

const emailScheme = Joi.string()
    .pattern(
        /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
    )
    .required();

const levelScheme = Joi.any().valid('0', '1', '2', '999').required();

// FIXME: 한글 4글자 초과도 허용됨
const nameScheme = Joi.string()
    .pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
    .required();

const numberScheme = Joi.number().positive();

const studentIdScheme = Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required();

const stringScheme = Joi.string().min(3).required();

const searchTargetScheme = Joi.string()
    .valid('title', 'body', 'titleAndBody')
    .required();

/**
 * Scheme wrappers
 * 1. Admin API
 * 2. Search API
 */
const userScheme = Joi.object({
    userName: nameScheme,
    email: emailScheme,
    studentId: studentIdScheme,
});

const permScheme = Joi.object({
    userId: numberScheme,
    level: levelScheme,
});

const introScheme = Joi.object({
    title: stringScheme,
    content: contentScheme,
});

const updateIntroScheme = Joi.object({
    introId: numberScheme,
    title: stringScheme,
    content: contentScheme,
});

/* Search API */
const searchInputScheme = Joi.object({
    key: stringScheme,
    target: searchTargetScheme,
});

const flagSubmitScheme = Joi.object({
    challId: numberScheme.required(),
    flag: Joi.string()
        .pattern(/^KUICS\{\w+\}$/) // 임시 플래그 포맷
        .required(),
});

module.exports = {
    numberScheme,
    userScheme,
    introScheme,
    permScheme,
    updateIntroScheme,
    searchInputScheme,
    flagSubmitScheme,
};
