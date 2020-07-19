const { boards } = require('../../models');

const getBoardList = async (req, res, next) => {
    try {
        const boardList = await boards.findAll({
            where: { type: 'board' },
            attributes: ['boardNo', 'title', 'hit', 'commentCount'],
        });

        res.json({ boardList });
    } catch (err) {
        next(err);
    }
};

const postBoard = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const boardInfo = req.body;

        await boards.create({
            ...boardInfo,
            type: 'board',
            hit: 0,
            commentCount: 0,
            userUserNo: userId,
        });

        res.json({});
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getBoardList,
    postBoard,
};
