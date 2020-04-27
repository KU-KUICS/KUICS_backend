const JWT = require('jsonwebtoken');
const Joi = require('@hapi/joi');

const { Users } = require('../../models');
const { AUTH_KEY } = require('../../../config/config.json');

const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
});

const login = async (req, res, next) => {
    try {
        const cred = await schema.validateAsync(req.body);
        const user = await Users.findAll({
            where: { nickname: cred.username, password: cred.password },
        });

        if (user.length) {
            const token = JWT.sign(
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
        } else {
            throw new Error('INVALID_PARAMETERS');
        }
        res.json(user);
    } catch (err) {
        next(new Error('INVALID_PARAMETERS'));
    }
};

const logout = (req, res, next) => {};
const register = (req, res, next) => {};
const unregister = (req, res, next) => {};
const findId = (req, res, next) => {};
const findPw = (req, res, next) => {};
const changePw = (req, res, next) => {};

module.exports = {
    login,
    logout,
    register,
    unregister,
    findId,
    findPw,
    changePw,
};
