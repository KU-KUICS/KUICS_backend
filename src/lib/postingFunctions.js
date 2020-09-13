const {
    boards,
    boardComments,
    recommendBoards,
    recommendComments,
    sequelize,
} = require('../models');

const { boardScheme, commentScheme, boardListScheme } = require('./schemes');

const {
    checkUser,
    checkBoard,
    checkComment,
    recommendedBoard,
    recommendedComment,
} = require('./validations');

const postFunction = async (req, res, next, type) => {
    try {
        const { userId } = req.query;

        const { error, value } = boardScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { title, body, level } = value;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { userLevel } = user;

        const writeAuth = level <= userLevel;
        if (!writeAuth) throw new Error('NO_AUTH');

        const excerpt = body.join(' ').substring(0, 150);

        /* ISSUE: 에러 발생하는 경우에 boardId 증가하지 않도록 (빈 번호 없도록) 처리 필요 */
        await boards.create({
            title,
            body,
            excerpt,
            type,
            hit: 0,
            commentCount: 0,
            userUserId: userId,
            level,
        });

        /* TODO: 이미지, 파일 정보 추가 */
        res.json({});
    } catch (err) {
        next(err);
    }
};

const reviseFunction = async (req, res, next, type) => {
    try {
        const { userId } = req.query;
        const { boardId } = req.params;

        const { error, value } = boardScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');
        const { title, body, level } = value;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { checkedId, userLevel } = user;

        const board = await checkBoard(boardId, type);
        if (!board) throw new Error('INVALID_PARAMETERS');

        const { writerBoardId } = board;

        const isWriterBoard = checkedId === writerBoardId;
        if (!isWriterBoard) throw new Error('NO_AUTH');

        const writeAuth = level <= userLevel;
        if (!writeAuth) throw new Error('NO_AUTH');

        const excerpt = body.join(' ').substring(0, 150);

        await boards.update(
            { title, body, excerpt, level },
            { where: { boardId } },
        );

        /* TODO: 이미지, 파일 정보 수정 (추가, 삭제) */
        res.json({});
    } catch (err) {
        next(err);
    }
};

const deleteFunction = async (req, res, next, type) => {
    try {
        const { boardId } = req.params;
        const { userId } = req.query;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { checkedId, userLevel } = user;

        const board = await checkBoard(boardId, type);
        if (!board) throw new Error('INVALID_PARAMETERS');

        const { writerBoardId } = board;

        const isWriterBoard = checkedId === writerBoardId;
        const isAdmin = userLevel === 999;
        if (!isWriterBoard && !isAdmin) throw new Error('NO_AUTH');

        await boards.destroy({ where: { boardId } });

        /* TODO: 이미지, 파일 정보, 댓글 접근 불가능하도록 수정 */
        res.json({});
    } catch (err) {
        next(err);
    }
};

const getListFunction = async (req, res, next, type) => {
    try {
        res.json({});
    } catch (err) {
        next(err);
    }
};

const getFunction = async (req, res, next, type) => {
    try {
        res.json({});
    } catch (err) {
        next(err);
    }
};

const recommendFunction = async (req, res, next, type) => {
    try {
        const { boardId } = req.params;
        const { userId } = req.query;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { userLevel } = user;

        const board = await checkBoard(boardId, type);
        if (!board) throw new Error('INVALID_PARAMETERS');

        const { readLevel } = board;

        const readAuth = readLevel <= userLevel;
        if (!readAuth) throw new Error('NO_AUTH');

        const checkRecommended = await recommendedBoard(boardId, userId);

        const t = await sequelize.transaction();

        if (!checkRecommended) {
            /* 추천하지 않은 경우, 추천하기 */
            await recommendBoards.create(
                {
                    boardBoardId: boardId,
                    userUserId: userId,
                },
                { transaction: t },
            );

            await boards.increment(
                'recommendedTime',
                {
                    by: 1,
                    where: { boardId },
                    silent: true,
                },
                { transaction: t },
            );
        } else {
            /* 이미 추천한 경우, 추천 취소하기 */
            await recommendBoards.destroy(
                {
                    where: {
                        boardBoardId: boardId,
                        userUserId: userId,
                    },
                },
                { transaction: t },
            );

            await boards.decrement(
                'recommendedTime',
                {
                    by: 1,
                    where: { boardId },
                    silent: true,
                },
                { transaction: t },
            );
        }

        await t.commit();

        res.json({});
    } catch (err) {
        next(err);
    }
};

const postCommentFunction = async (req, res, next, type) => {
    try {
        const { userId } = req.query;
        const { boardId } = req.params;

        const { error, value } = commentScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { body } = value;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { userLevel } = user;

        const board = await checkBoard(boardId, type);
        if (!board) throw new Error('INVALID_PARAMETERS');

        const { readLevel } = board;

        const readAuth = readLevel <= userLevel;
        if (!readAuth) throw new Error('NO_AUTH');

        const t = await sequelize.transaction();

        await boardComments.create(
            {
                body,
                recommendedTime: 0,
                userUserId: userId,
                boardBoardId: boardId,
            },
            { transaction: t },
        );

        await boards.increment(
            'commentCount',
            {
                by: 1,
                where: { boardId },
                silent: true,
            },
            { transaction: t },
        );

        await t.commit();

        res.json({});
    } catch (err) {
        next(err);
    }
};

const reviseCommentFunction = async (req, res, next, type) => {
    try {
        const { userId } = req.query;
        const { boardId, commentId } = req.params;

        const { error, value } = commentScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { body } = value;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { checkedId, userLevel } = user;

        const board = await checkBoard(boardId, type);
        if (!board) throw new Error('INVALID_PARAMETERS');

        const { readLevel } = board;

        const comment = await checkComment(boardId, commentId);
        if (!comment) throw new Error('INVALID_PARAMETERS');

        const { writerCommentId } = comment;

        const isWriterComment = checkedId === writerCommentId;
        if (!isWriterComment) throw new Error('NO_AUTH');

        const readAuth = readLevel <= userLevel;
        if (!readAuth) throw new Error('NO_AUTH');

        await boardComments.update({ body }, { where: { commentId } });

        res.json({});
    } catch (err) {
        next(err);
    }
};

const deleteCommentFunction = async (req, res, next, type) => {
    try {
        const { userId } = req.query;
        const { boardId, commentId } = req.params;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { checkedId, userLevel } = user;

        const board = await checkBoard(boardId, type);
        if (!board) throw new Error('INVALID_PARAMETERS');

        const { readLevel } = board;

        const comment = await checkComment(boardId, commentId);
        if (!comment) throw new Error('INVALID_PARAMETERS');

        const { writerCommentId } = comment;

        const isWriterComment = checkedId === writerCommentId;
        const isAdmin = userLevel === 999;
        if (!isWriterComment && !isAdmin) throw new Error('NO_AUTH');

        const readAuth = readLevel <= userLevel;
        if (!readAuth) throw new Error('NO_AUTH');

        const t = await sequelize.transaction();

        await boardComments.destroy(
            { where: { commentId } },
            { transaction: t },
        );

        await boards.decrement(
            'commentCount',
            {
                by: 1,
                where: { boardId },
                silent: true,
            },
            { transaction: t },
        );

        await t.commit();

        res.json({});
    } catch (err) {
        next(err);
    }
};

const recommendCommentFunction = async (req, res, next, type) => {
    try {
        const { boardId, commentId } = req.params;
        const { userId } = req.query;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { userLevel } = user;

        const board = await checkBoard(boardId, type);
        if (!board) throw new Error('INVALID_PARAMETERS');

        const { readLevel } = board;

        const comment = await checkComment(boardId, commentId);
        if (!comment) throw new Error('INVALID_PARAMETERS');

        const readAuth = readLevel <= userLevel;
        if (!readAuth) throw new Error('NO_AUTH');

        const checkRecommended = await recommendedComment(commentId, userId);

        const t = await sequelize.transaction();
        if (!checkRecommended) {
            /* 추천하지 않은 경우, 추천하기 */
            await recommendComments.create(
                {
                    boardCommentCommentId: commentId,
                    userUserId: userId,
                },
                { transaction: t },
            );

            await boardComments.increment(
                'recommendedTime',
                {
                    by: 1,
                    where: { commentId },
                    silent: true,
                },
                { transaction: t },
            );
        } else {
            /* 이미 추천한 경우, 추천 취소하기 */
            await recommendComments.destroy(
                {
                    where: {
                        boardCommentCommentId: commentId,
                        userUserId: userId,
                    },
                },
                { transaction: t },
            );

            await boardComments.decrement(
                'recommendedTime',
                {
                    by: 1,
                    where: { commentId },
                    silent: true,
                },
                { transaction: t },
            );
        }

        await t.commit();

        res.json({});
    } catch (err) {
        next(err);
    }
};

module.exports = {
    postFunction,
    reviseFunction,
    deleteFunction,
    getListFunction,
    getFunction,
    recommendFunction,
    postCommentFunction,
    reviseCommentFunction,
    deleteCommentFunction,
    recommendCommentFunction,
};
