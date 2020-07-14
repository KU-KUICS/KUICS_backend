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
        let email = null;
        if (true) {
            email = req.query.email;
        } else {
            email = req.user.emails[0].value;
        }
        const checkAdmin = await isAdmin(email);

        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const userList = await users.findAll();
        res.json({ users: userList });
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        let email = null;
        if (true) {
            email = req.query.email;
        } else {
            email = req.user.emails[0].value;
        }
        const checkAdmin = await isAdmin(email);
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

const postUserAuth = async (req, res, next) => {
    try {
        let email = null;
        if (true) {
            email = req.query.email;
        } else {
            email = req.user.emails[0].value;
        }
        const checkAdmin = await isAdmin(email);

        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const userList = await users.findAll();
        res.json({ users: userList });
    } catch (err) {
        next(err);
    }
};

const postNotice = async (req, res, next) => {
    try {
        let email = null;
        if (true) {
            email = req.query.email;
        } else {
            email = req.user.emails[0].value;
        }
        const checkAdmin = await isAdmin(email);

        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const userList = await users.findAll();
        res.json({ users: userList });
    } catch (err) {
        next(err);
    }
};

const postEditNotice = async (req, res, next) => {
    try {
        let email = null;
        if (true) {
            email = req.query.email;
        } else {
            email = req.user.emails[0].value;
        }
        const checkAdmin = await isAdmin(email);

        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const userList = await users.findAll();
        res.json({ users: userList });
    } catch (err) {
        next(err);
    }
};

const deleteNotice = async (req, res, next) => {
    try {
        let email = null;
        if (true) {
            email = req.query.email;
        } else {
            email = req.user.emails[0].value;
        }
        const checkAdmin = await isAdmin(email);

        if (!checkAdmin) throw new Error('NOT_ADMIN');

        const userList = await users.findAll();
        res.json({ users: userList });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getUser,
    deleteUser,
    postUserAuth,
    postNotice,
    postEditNotice,
    deleteNotice,
};
