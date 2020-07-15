const Joi = require('@hapi/joi');
const crypto = require('crypto');
const { users } = require('../../models');
const { boards } = require('../../models');

/* 검증 스키마 */
const numberSchema = Joi.string()
    .pattern(/^[0-9]+$/)
    .required();

// FIXME: 한글 4글자 초과도 허용됨
const nameSchema = Joi.string()
    .pattern(/^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/)
    .required();

const emailSchema = Joi.string()
    .pattern(
        /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
    )
    .required();

const studentIdSchema = Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required();

const levelSchema = Joi.any().valid('0', '1', '2', '999').required();

const isAdmin = async (email) => {
    const admin = await users.findOne({
        where: { email, level: 999 },
    });
    return admin;
};

/**
 *  유저 정보를 읽어옴
 *  @route GET /api/admin/user
 *  @group Admin
 *  @returns {Array} 200 - 유저 리스트
 *  @returns {Error} NOT_ADMIN - NOT_ADMIN
 */
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

/**
 * @typedef UserInfo
 * @property {string} userName.requierd
 * @property {string} email.required
 * @property {string} studentId.required
 */

/**
 *  유저 정보를 추가함
 *  @route POST /api/admin/users
 *  @group Admin
 *  @param {UserInfo.model} userInfo.body.required - 유저 정보
 *  @returns {object} 200 - 빈 객체
 *  @returns {Error} NOT_ADMIN - NOT_ADMIN
 *  @returns {Error} INVALID_PARAMETERS - INVALID_PARAMETERS
 */
const postUser = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const inputScheme = Joi.object({
            userName: nameSchema,
            email: emailSchema,
            studentId: studentIdSchema,
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

/**
 * @typedef UserPermision
 * @property {number} userNo.required
 * @property {number} level.required
 */

/**
 *  유저 권한을 설정함
 *  @route PUT /api/admin/user/permission
 *  @group Admin
 *  @param {UserPermission.model} userPermission.body.required - 유저 권한 정보
 *  @returns {object} 200 - 빈 객체
 *  @returns {Error} NOT_ADMIN - NOT_ADMIN
 *  @returns {Error} INVALID_PARAMETERS - INVALID_PARAMETERS
 */
const putUserPermission = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const inputScheme = Joi.object({
            userNo: numberSchema,
            level: levelSchema,
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

/**
 *  유저 삭제
 *  @route DELETE /api/admin/user/{userNo}
 *  @group Admin
 *  @param {number} userNo.required - 유저 넘버
 *  @returns {object} 200 - 빈 객체
 *  @returns {Error} NOT_ADMIN - NOT_ADMIN
 *  @returns {Error} INVALID_PARAMETERS - INVALID_PARAMETERS
 */
const deleteUser = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const inputScheme = Joi.object({ userNo: numberSchema });
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
const putEditNotice = async (req, res, next) => {};
const deleteNotice = async (req, res, next) => {};

module.exports = {
    getUser,
    postUser,
    putUserPermission,
    deleteUser,
    postNotice,
    putEditNotice,
    deleteNotice,
};
