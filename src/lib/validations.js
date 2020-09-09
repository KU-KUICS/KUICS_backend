const {
    boards,
    boardComments,
    users,
    recommendBoards,
    recommendComments,
} = require('../models');

const checkUser = async (userId) => {
    const user = await users.findOne({
        where: { userId, state: 0, level: [1, 2, 999] },
        attributes: [
            ['userId', 'checkedId'],
            ['level', 'userLevel'],
        ],
        raw: true,
    });
    return user;
};

const checkBoard = async (boardId) => {
    const board = await boards.findOne({
        where: { boardId, deletedAt: null },
        paranoid: false,
        attributes: [
            ['userUserId', 'writerBoardId'],
            ['level', 'readLevel'],
        ],
        raw: true,
    });
    return board;
};
const checkComment = async (boardBoardId, commentId) => {
    const comment = await boardComments.findOne({
        where: { boardBoardId, commentId, deletedAt: null },
        paranoid: false,
        attributes: [['userUserId', 'writerCommentId']],
        raw: true,
    });
    return comment;
};

const recommendedBoard = async (boardBoardId, userUserId) => {
    const recommended = await recommendBoards.findOne({
        where: { boardBoardId, userUserId },
    });
    return recommended;
};

const recommendedComment = async (boardCommentCommentId, userUserId) => {
    const recommended = await recommendComments.findOne({
        where: { boardCommentCommentId, userUserId },
    });
    return recommended;
};

module.exports = {
    checkUser,
    checkBoard,
    checkComment,
    recommendedBoard,
    recommendedComment,
};
