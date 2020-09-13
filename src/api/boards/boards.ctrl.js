const {
    boards,
    boardComments,
    recommendBoards,
    recommendComments,
    sequelize,
} = require('../../models');

const { commentScheme, boardListScheme } = require('../../lib/schemes');

const {
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
} = require('../../lib/postingFunctions');

const {
    checkUser,
    checkBoard,
    checkComment,
    recommendedBoard,
    recommendedComment,
} = require('../../lib/validations');

/* TODO: 권한 확인 query, 데이터 요청 query 통합 */
/* TODO: 게시글에 tag 붙이기 */
/* TODO: user 가져오는 방식 변경 (req.user.emails[0].value) */

/**
 *  page에 해당하는 글 리스트 가져오기
 *  @route GET /api/board/page/{page}
 *  @group Board
 *  @param {number} page.path.required - 페이지 번호
 *  @param {number} count.query.optional - 글 개수
 *  @returns {Object} 200 - 글 리스트
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 */
const getBoardList = async (req, res, next) => {
    try {
        const baseCount = 10;

        const { error, value } = boardListScheme.validate({
            page: req.params.page,
            count: req.query.count,
        });
        if (error) throw new Error('INVALID_PARAMETERS');

        const { page, count } = value;

        const limit = count || baseCount; // count 없는 경우 baseCount 사용
        const offset = (page - 1) * limit;

        const boardList = await boards.findAll({
            offset,
            limit,
            order: [['boardId', 'DESC']],
            attributes: [
                'boardId',
                'excerpt',
                'title',
                'commentCount',
                'hit',
                'updatedAt',
            ],
        });

        res.json({ boardList });
    } catch (err) {
        next(err);
    }
};

/**
 *  boardId에 해당하는 글 정보 가져오기
 *  @route GET /api/board/{boardId}
 *  @group Board
 *  @param {number} boardId.path.required - 글 번호
 *  @returns {Object, Array} 200 - 글 정보, 댓글 리스트
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_LOGIN - no login
 *  @returns {Error} NO_AUTH - unauthorized
 */
const getBoard = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { boardId } = req.params;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { userLevel } = user;

        const board = await checkBoard(boardId, 'board');
        if (!board) throw new Error('INVALID_PARAMETERS');

        const { readLevel } = board;

        const readAuth = readLevel <= userLevel;
        if (!readAuth) throw new Error('NO_AUTH');

        await boards.increment('hit', {
            by: 1,
            where: { boardId },
            silent: true,
        });

        const boardData = await boards.findOne({
            where: { boardId },
            /* attributes: [], */
        });

        const commentList = await boardComments.findAll({
            where: { boardBoardId: boardId },
            attributes: [
                'commentId',
                'body',
                'recommendedTime',
                'createdAt',
                'updatedAt',
                'userUserId',
            ],
            order: [['commentId', 'ASC']],
        });

        /* TODO: 이미지, 파일 정보 추가 -> hashing */
        /* TODO: 작성자 정보 추가 (게시글, 댓글) */

        res.json({ boardData, commentList });
    } catch (err) {
        next(err);
    }
};

/**
 * @typedef boardScheme
 * @property {string} title.required
 * @property {Array<string>} body.required
 * @property {number} level.required
 */

/**
 *  글 작성하기
 *  @route POST /api/board
 *  @group Board
 *  @param {boardScheme.model} boardScheme.body.required - 작성할 글 정보
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const postBoard = async (req, res, next) => {
    try {
        postFunction(req, res, next, 'board');
    } catch (err) {
        next(err);
    }
};

/**
 *  boardId에 해당하는 글 수정하기
 *  @route PUT /api/board/{boardId}
 *  @group Board
 *  @param {number} boardId.path.required - 글 번호
 *  @param {boardScheme.model} boardScheme.body.required - 작성할 글 정보
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const reviseBoard = async (req, res, next) => {
    try {
        reviseFunction(req, res, next, 'board');
    } catch (err) {
        next(err);
    }
};

/**
 *  boardId에 해당하는 글 삭제하기
 *  @route DELETE /api/board/{boardId}
 *  @group Board
 *  @param {number} boardId.path.required - 글 번호
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const deleteBoard = async (req, res, next) => {
    try {
        deleteFunction(req, res, next, 'board');
    } catch (err) {
        next(err);
    }
};

/**
 *  boardId에 해당하는 글 추천하기
 *  @route POST /api/board/{boardId}/recommend
 *  @group Board
 *  @param {number} boardId.path.required - 글 번호
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const recommendBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const { userId } = req.query;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { userLevel } = user;

        const board = await checkBoard(boardId, 'board');
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

/**
 * @typedef commentScheme
 * @property {string} body.required
 */

/**
 *  댓글 작성하기
 *  @route POST /api/board/{boardId}/comment
 *  @group Board
 *  @param {number} boardId.path.required - 글 번호
 *  @param {commentScheme.model} commentScheme.body.required - 작성할 댓글 정보
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const postCommentBoard = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { boardId } = req.params;

        const { error, value } = commentScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { body } = value;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { userLevel } = user;

        const board = await checkBoard(boardId, 'board');
        if (!board) throw new Error('INVALID_PARAMETERS');

        const { readLevel } = board;

        const readAuth = readLevel <= userLevel;
        if (!readAuth) throw new Error('NO_AUTH');

        await boardComments.create({
            body,
            recommendedTime: 0,
            userUserId: userId,
            boardBoardId: boardId,
        });

        await boards.increment('commentCount', {
            by: 1,
            where: { boardId },
            silent: true,
        });

        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 *  댓글 수정하기
 *  @route PUT /api/board/{boardId}/comment/{commentId}
 *  @group Board
 *  @param {number} boardId.path.required - 글 번호
 *  @param {number} commentId.path.required - 댓글 번호
 *  @param {commentScheme.model} commentScheme.body.required - 작성할 댓글 정보
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const reviseCommentBoard = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { boardId, commentId } = req.params;

        const { error, value } = commentScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { body } = value;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { checkedId, userLevel } = user;

        const board = await checkBoard(boardId, 'board');
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

/**
 *  댓글 삭제하기
 *  @route DELETE /api/board/{boardId}/comment/{commentId}
 *  @group Board
 *  @param {number} boardId.path.required - 글 번호
 *  @param {number} commentId.path.required - 댓글 번호
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const deleteCommentBoard = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { boardId, commentId } = req.params;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { checkedId, userLevel } = user;

        const board = await checkBoard(boardId, 'board');
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

        await boardComments.destroy({ where: { commentId } });

        await boards.decrement('commentCount', {
            by: 1,
            where: { boardId },
            silent: true,
        });

        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 *  commentId에 해당하는 글 추천하기
 *  @route POST /api/board/{boardId}/comment/{commentId}/recommend
 *  @group Board
 *  @param {number} boardId.path.required - 글 번호
 *  @param {number} commentId.path.required - 댓글 번호
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const recommendCommentBoard = async (req, res, next) => {
    try {
        const { boardId, commentId } = req.params;
        const { userId } = req.query;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { userLevel } = user;

        const board = await checkBoard(boardId, 'board');
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
    getBoardList,
    getBoard,
    postBoard,
    reviseBoard,
    deleteBoard,
    recommendBoard,
    postCommentBoard,
    reviseCommentBoard,
    deleteCommentBoard,
    recommendCommentBoard,
};
