const { Users } = require('../../models');

const getAdmin = (req, res) => {
    const { user_id } = req.params;
    res.json({
        user_id,
    });
};

const postAdmin = async (req, res, next) => {
    const user_id = Number(req.body.user_id);

    try {
        if (user_id !== 10) throw new Error('WRONG_USER_ID');

        const users = await Users.find({
            where: {
                user_id,
            },
        });

        res.json({
            users,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdmin,
    postAdmin,
};
