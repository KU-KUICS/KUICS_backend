const Joi = require('@hapi/joi');

/**
 * Scheme primitives
 */
const contentScheme = Joi.array().items(Joi.string()).required();

const boardLevelScheme = Joi.any().valid('1', '2').required();

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

const numberScheme = Joi.number().positive().required();

const numberSchemeOptional = Joi.number().positive().optional();

const studentIdScheme = Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required();

const stringScheme = Joi.string().min(3).required();

const searchScheme = Joi.string().min(2); // search 검사 조건 구체화 필요

const searchDurationScheme = Joi.array(); // Duration search 검사 조건 구체화 필요

/**
 * Scheme wrappers
 * 1. Admin API
 * 2. Search API
 * 3. Board API
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
    title: searchScheme,
    body: searchScheme,
    duration: searchDurationScheme,
    userName: searchScheme,
    tag: searchScheme,
});

/* Board API */
const boardScheme = Joi.object({
    title: stringScheme,
    body: contentScheme,
    level: boardLevelScheme,
});

const commentScheme = Joi.object({
    body: stringScheme,
});

const boardListScheme = Joi.object({
    page: numberScheme,
    count: numberSchemeOptional,
});

module.exports = {
    userScheme,
    introScheme,
    permScheme,
    updateIntroScheme,
    searchInputScheme,
    boardScheme,
    commentScheme,
    boardListScheme,
};
