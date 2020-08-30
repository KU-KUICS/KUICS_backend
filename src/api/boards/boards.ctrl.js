const Joi = require('@hapi/joi');
const {
    boards,
    boardComments,
    users,
    recommendBoards,
    recommendComments,
    sequelize,
} = require('../../models');

/* TODO: scheme library로 이동 */
// const { } = require('../../lib/schemes');

const titleScheme = Joi.string().min(3).required();
const bodyScheme = Joi.array().items(Joi.string()).required();
const boardLevelScheme = Joi.any().valid('1', '2').required();

const boardScheme = Joi.object({
    title: titleScheme,
    body: bodyScheme,
    level: boardLevelScheme,
});

const commentScheme = Joi.object({
    body: bodyScheme,
});

const numberScheme = Joi.number().positive().required();
const numberSchemeOptional = Joi.number().positive().optional();

const boardListScheme = Joi.object({
    page: numberScheme,
    count: numberSchemeOptional,
});

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

/* TODO: 권한 확인 query, 데이터 요청 query 통합 */
/* TODO: 게시글에 tag 붙이기 */
/* TODO: user 가져오는 방식 변경 (req.user.emails[0].value) */

/**
 *  page에 해당하는 글 리스트 가져오기
 *  @route GET /api/board/page/{page}
 *  @group Board
 *  @param {number} page.path.required - 페이지 번호
 *  @param {number} count.query - 글 개수
 *  @returns {Object} 200 - 글 리스트
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 */
const getBoardList = async (req, res, next) => {
    try {
        const pageCount = 10;
        const baseLimit = 10;

        const { error, value } = boardListScheme.validate({
            page: req.params.page,
            count: req.query.count,
        });
        if (error) throw new Error('INVALID_PARAMETERS');

        const { page, count } = value;
        const offset = (page - 1) * pageCount;
        const limit = count || baseLimit;

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

        const board = await checkBoard(boardId);
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
 * @property {string} body.required
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
            type: 'board',
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
        const { userId } = req.query;
        const { boardId } = req.params;

        const { error, value } = boardScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');
        const { title, body, level } = value;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { checkedId, userLevel } = user;

        const board = await checkBoard(boardId);
        if (!board) throw new Error('INVALID_PARAMETERS');

        const { writerBoardId } = board;

        const isWriterBoard = checkedId === writerBoardId;
        if (!isWriterBoard) throw new Error('NO_AUTH');

        const writeAuth = level <= userLevel;
        if (!writeAuth) throw new Error('NO_AUTH');

        const excerpt = body.substring(0, 150);

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
        const { boardId } = req.params;
        const { userId } = req.query;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { checkedId, userLevel } = user;

        const board = await checkBoard(boardId);
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

        const board = await checkBoard(boardId);
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
const postComment = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { boardId } = req.params;

        const { error, value } = commentScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { body } = value;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { userLevel } = user;

        const board = await checkBoard(boardId);
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
const reviseComment = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { boardId, commentId } = req.params;

        const { error, value } = commentScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');

        const { body } = value;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { checkedId, userLevel } = user;

        const board = await checkBoard(boardId);
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
const deleteComment = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { boardId, commentId } = req.params;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { checkedId, userLevel } = user;

        const board = await checkBoard(boardId);
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
const recommendComment = async (req, res, next) => {
    try {
        const { boardId, commentId } = req.params;
        const { userId } = req.query;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { userLevel } = user;

        const board = await checkBoard(boardId);
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
    postComment,
    reviseComment,
    deleteComment,
    recommendComment,
};
