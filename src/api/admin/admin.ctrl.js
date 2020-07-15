const Joi = require('@hapi/joi');
const crypto = require('crypto');
const { users } = require('../../models');
const { boards } = require('../../models');

const isAdmin = async (email) => {
    const level = 999;
    const admin = await users.findOne({
        where: { email, level },
    });

    return admin;
};

const getUser = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        // TODO: 관리자 제외? || 탈퇴자 제외?
        const userList = await users.findAll();
        res.json({ userList });
    } catch (err) {
        next(err);
    }
};

const postUser = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const inputScheme = Joi.object({
            // FIXME: 한글 4글자 초과도 허용됨
            userName: Joi.string()
                .pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
                .required(),
            email: Joi.string()
                .pattern(
                    /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
                )
                .required(),
            studentId: Joi.string()
                .pattern(/^[0-9]{10}$/)
                .required(),
        });
        const { error, value } = inputScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { userName, email, studentId } = value;
        await users.create({
            userName,
            email,
            studentId,
            joinedAt: new Date(Date.now()),
            level: 1,
            state: 0,
        });

        res.json({});
    } catch (err) {
        next(err);
    }
};

const postUserPermission = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const inputScheme = Joi.object({
            userNo: Joi.string()
                .pattern(/^[0-9]+$/)
                .required(),
            level: Joi.any().valid('0', '1', '2', '999').required(),
        });
        const { error, value } = inputScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { userNo, level } = value;
        const user = await users.findOne({
            where: { userNo },
        });
        if (!user) throw new Error('INVALID_PARAMETERS');
        if (user.dataValues.state) throw new Error('INVALID_PARAMETERS');

        await users.update({ level }, { where: { userNo } });
        res.json({});
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const inputScheme = Joi.object({
            userNo: Joi.string()
                .pattern(/^[0-9]+$/)
                .required(),
        });
        const { error, value } = inputScheme.validate(req.params);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { userNo } = value;
        const user = await users.findOne({ where: { userNo } });
        if (!user) throw new Error('INVALID_PARAMETERS');
        if (user.dataValues.state) throw new Error('INVALID_PARAMETERS');

        /* 삭제한 회원의 정보를 전부 해시 처리함 */
        const { userName, email, studentId } = user.dataValues;
        const hash = (msg) => {
            return crypto.createHash('sha256').update(msg).digest('hex');
        };
        await users.update(
            {
                userName: hash(userName),
                email: hash(email),
                studentId: hash(studentId),
                level: 0,
                state: 1,
            },
            { where: { userNo } },
        );

        res.json({});
    } catch (err) {
        next(err);
    }
};

const postNotice = async (req, res, next) => {};
const postEditNotice = async (req, res, next) => {};
const deleteNotice = async (req, res, next) => {};

module.exports = {
    getUser,
    postUser,
    postUserPermission,
    deleteUser,
    postNotice,
    postEditNotice,
    deleteNotice,
};
