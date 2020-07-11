const jwt = require('jsonwebtoken');
const joi = require('@hapi/joi');
const crypto = require('crypto');

const { users } = require('../../../models');
const { AUTH_KEY } = require('../../../config/config.json');

const schema = joi.object({
    username: joi.string().alphanum().min(3).max(30).required(),
    password: joi
        .string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
});

/**
 * 로그인
 * @route POST /api/auth/login
 * @group Auth
 * @param { string } loginEntry.body.required - 로그인 입력
 * @returns { object } 200 - 유저 정보
 * @reutrns { Error } AUTH_INVALID_INPUT - AUTH_INVALID_INPUT
 */
const postLogin = async (req, res, next) => {
    try {
        const { err, value } = await schema.validateAsync(req.body);

        if (err) throw new Error('INVALID_PARAMETERS');

        const { username, password } = value;

        /* 해시 솔트 */
        const hashPw = crypto
            .createHash('sha-256')
            .update(password)
            .digest('hex');

        const user = await users.findAll({
            where: { username, password: hashPw },
        });

        if (!user) throw new Error('INVALID_PARAMETERS');

        const token = jwt.sign(
            {
                role: user.level,
            },
            AUTH_KEY,
            {
                expiresIn: '1d',
            },
        );
        res.cookie('token', token);
        res.json({ token });
        res.json(user);
    } catch (err) {
        next(new Error('INVALID_PARAMETERS'));
    }
};

const postLogout = (req, res, next) => {};
const postRegister = (req, res, next) => {};
const postUnregister = (req, res, next) => {};
const findId = (req, res, next) => {};
const findPw = (req, res, next) => {};
const changePw = (req, res, next) => {};

module.exports = {
    postLogin,
    postLogout,
    postRegister,
    postUnregister,
    findId,
    findPw,
    changePw,
};
