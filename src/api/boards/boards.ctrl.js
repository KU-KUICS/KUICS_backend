const { boards, sequelize } = require('../../models');

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
    // TODO
    // 미리보기
};

const getBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;

        await boards.update(
            { hit: sequelize.literal('hit + 1') },
            { where: { boardNo: boardId }, silent: true },
        );

        const board = await boards.findAll({
            where: { boardNo: boardId },
            attributes: [
                'boardNo',
                'type',
                'title',
                'body',
                'hit',
                'commentCount',
                'createdAt',
                'updatedAt',
                'deletedAt',
                'userUserNo',
            ],
        });
        res.json({ board });
    } catch (err) {
        next(err);
    }
    // TODO
    // 이미지, 파일 정보 추가
    // comment 정보 추가
    // 유저 정보 추가
    // 보기 권한 추가 (준회원, 정회원, 관리자) -> error handiling
};

const postBoard = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { title, body } = req.body;

        await boards.create({
            title,
            body,
            type: 'board',
            hit: 0,
            commentCount: 0,
            userUserNo: userId,
        });

        res.json({});
    } catch (err) {
        next(err);
    }
    // TODO
    // 이미지, 파일 정보 추가
    // expected error: wrong userId
};

const reviseBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;

        res.json({ boardId });
    } catch (err) {
        next(err);
    }
};

const deleteBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;

        res.json({ boardId });
    } catch (err) {
        next(err);
    }
};

const postComment = async (req, res, next) => {
    try {
        res.json({});
    } catch (err) {
        next(err);
    }
};

const reviseComment = async (req, res, next) => {
    try {
        const { boardId, commentId } = req.params;

        res.json({ boardId, commentId });
    } catch (err) {
        next(err);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const { boardId, commentId } = req.params;

        res.json({ boardId, commentId });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getBoardList,
    getBoard,
    postBoard,
    reviseBoard,
    deleteBoard,
    postComment,
    reviseComment,
    deleteComment,
};
