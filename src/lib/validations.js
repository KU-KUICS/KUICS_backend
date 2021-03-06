const {
    boards,
    boardComments,
    users,
    recommendBoards,
    recommendComments,
} = require('../models');

/* TODO: email 이용한 validation으로 수정 */
const isAdmin = async (userId) => {
    const admin = await users.findOne({
        where: { userId, state: 0, level: 999 },
    });
    return admin;
};

/* TODO: email 이용한 validation으로 수정 */
const isUser = async (userId) => {
    const user = await users.findOne({
        where: { userId, state: 0, level: [1, 2, 999] },
        attributes: [
            ['userId', 'iedId'],
            ['level', 'userLevel'],
        ],
        raw: true,
    });
    return user;
};

const isBoard = async (boardId, type) => {
    const board = await boards.findOne({
        where: { boardId, type, deletedAt: null },
        paranoid: false,
        attributes: [
            ['userUserId', 'writerBoardId'],
            ['level', 'readLevel'],
        ],
        raw: true,
    });
    return board;
};

const isComment = async (boardBoardId, commentId) => {
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
    isAdmin,
    isUser,
    isBoard,
    isComment,
    recommendedBoard,
    recommendedComment,
};
