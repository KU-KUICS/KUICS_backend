const { users } = require('../../../models');

const postAuth = async (req, res, next) => {
    try {
        const userInfo = req.body;
        if (!userInfo) throw new Error('AUTH_NO_INPUT');

        await users.create({
            ...userInfo,
            joinedAt: new Date(),
            level: 0,
            state: 0,
        });

        res.json({});
    } catch (err) {
        next(err);
    }
};

module.exports = {
    postAuth,
};
