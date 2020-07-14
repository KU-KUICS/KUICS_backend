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

        if (!req.body.userName) throw new Error('INVALID_PARAMETERS');
        if (!req.body.email) throw new Error('INVALID_PARAMETERS');
        if (!req.body.studentId) throw new Error('INVALID_PARAMETERS');

        await users.create({
            userName: req.body.userName,
            email: req.body.email,
            studentId: req.body.studentId,
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

        if (!req.body.user_id) throw new Error('INVALID_PARAMETERS');
        if (!req.body.level) throw new Error('INVALID_PARAMETERS');

        const user = await users.findOne({
            where: { userNo: req.body.user_id },
        });
        if (!user) throw new Error('INVALID_PARAMETERS');
        if (user.dataValues.state) throw new Error('INVALID_PARAMETERS');

        await users.update(
            {
                level: req.body.level,
            },
            { where: { userNo: req.body.user_id } },
        );

        res.json({});
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const checkAdmin = await isAdmin(req.user.emails[0].value);
        if (!checkAdmin) throw new Error('NOT_ADMIN');

        if (!req.params.user_id) throw new Error('INVALID_PARAMETERS');

        const user = await users.findOne({
            where: { userNo: req.params.user_id },
        });
        if (!user) throw new Error('INVALID_PARAMETERS');
        if (user.dataValues.state) throw new Error('INVALID_PARAMETERS');

        const hash = (msg) => {
            return crypto.createHash('sha256').update(msg).digest('hex');
        };

        /* 삭제한 회원의 정보를 전부 해시 처리함 */
        await users.update(
            {
                userName: hash(user.dataValues.userName),
                email: hash(user.dataValues.email),
                studentId: hash(user.dataValues.studentId),
                level: 0,
                state: 1,
            },
            { where: { userNo: req.params.user_id } },
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
