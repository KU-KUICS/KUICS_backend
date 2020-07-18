const Joi = require('@hapi/joi');
const {
    boards,
    boardComments,
    users,
    recommendBoards,
    recommendComments,
} = require('../../models');

const titleScheme = Joi.string().min(3).required();
const bodyScheme = Joi.string().required();
const levelScheme = Joi.any().valid('0', '1', '2', '999').required();

const boardScheme = Joi.object({
    title: titleScheme,
    body: bodyScheme,
    level: levelScheme,
});

const commentScheme = Joi.object({
    body: bodyScheme,
});

const existsBoard = async (boardNo) => {
    const board = await boards.findOne({
        where: { boardNo, deletedAt: null },
        paranoid: false,
    });
    return board;
};

const isWriterBoard = async (boardNo, userUserNo) => {
    const board = await boards.findOne({
        where: { boardNo, userUserNo },
    });
    return board;
};

const hasAuth = async (userNo) => {
    const auth = await users.findOne({
        where: { userNo, state: 0, level: [1, 2, 999] },
    });
    return auth;
};

const isRegularMember = async (userNo) => {
    const regular = await users.findOne({
        where: { userNo, level: [2, 999] },
    });
    return regular;
};

const isAdmin = async (userNo) => {
    const admin = await users.findOne({
        where: { userNo, level: 999 },
    });
    return admin;
};

const recommendedBoard = async (boardBoardNo, userUserNo) => {
    const recommended = await recommendBoards.findOne({
        where: { boardBoardNo, userUserNo },
    });
    return recommended;
};

const existsComment = async (boardBoardNo, boardCommentsNo) => {
    const comment = await boardComments.findOne({
        where: { boardBoardNo, boardCommentsNo, deletedAt: null },
        paranoid: false,
    });
    return comment;
};

const isWriterComment = async (boardCommentsNo, userUserNo) => {
    const comment = await boardComments.findOne({
        where: { boardCommentsNo, userUserNo },
    });
    return comment;
};

const recommendedComment = async (boardCommentBoardCommentsNo, userUserNo) => {
    const recommended = await recommendComments.findOne({
        where: { boardCommentBoardCommentsNo, userUserNo },
    });
    return recommended;
};

/* TODO: 게시글에 tag 붙이기 */
/* TODO: auth 관련 함수 통일 */
/* TODO: user 가져오는 방식 변경 (req.user.emails[0].value) */
/**
 *  글 미리보기 정보 가져오기
 *  @route GET /api/board
 *  @group Board
 *  @returns {Object} 200 - 글 미리보기
 *  @returns {Error} DELETED - already deleted
 */
const getBoardList = async (req, res, next) => {
    try {
        const { boardId } = req.query;

        const checkExists = await existsBoard(boardId);
        if (!checkExists) {
            throw new Error('DELETED');
        }

        const boardList = await boards.findOne({
            where: { type: 'board', boardNo: boardId },
            attributes: [
                'boardNo',
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
 *  @route GET /api/board/:boardId
 *  @group Board
 *  @returns {Object, Array} 200 - 글 정보, 댓글 리스트
 *  @returns {Error} DELETED - already deleted
 *  @returns {Error} NO_LOGIN - no login
 *  @returns {Error} NO_AUTH - unauthorized
 */
const getBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;

        const checkExists = await existsBoard(boardId);
        if (!checkExists) {
            throw new Error('DELETED');
        }

        const { level } = await boards.findOne({
            where: { boardNo: boardId },
            raw: true,
        });

        /* 읽기 권한이 필요한 경우 권한 검증 */
        if (level !== 0) {
            const { userId } = req.query;
            if (!userId) throw new Error('NO_LOGIN');

            const checkRegularMember = await isRegularMember(userId);
            const checkAuth = await hasAuth(userId);
            const checkAdmin = await isAdmin(userId);
            const checkWriter = await isWriterBoard(boardId, userId);

            switch (level) {
                case 1:
                    if (!checkAuth) throw new Error('NO_AUTH');
                    break;
                case 2:
                    if (!checkAuth || !checkRegularMember)
                        throw new Error('NO_AUTH');
                    break;
                case 999:
                    if (!checkAdmin && !checkWriter) throw new Error('NO_AUTH');
                    break;
                default:
                    break;
            }
        }

        await boards.increment('hit', {
            by: 1,
            where: { boardNo: boardId },
            silent: true,
        });

        const board = await boards.findAll({
            where: { boardNo: boardId },
            attributes: [
                'boardNo',
                'type',
                'title',
                'body',
                'excerpt',
                'hit',
                'commentCount',
                'level',
                'createdAt',
                'updatedAt',
                'userUserNo',
            ],
        });

        const commentList = await boardComments.findAll({
            where: { boardBoardNo: boardId },
            attributes: [
                'boardCommentsNo',
                'body',
                'recommendedTime',
                'createdAt',
                'updatedAt',
                'userUserNo',
            ],
            order: [['boardCommentsNo', 'ASC']],
        });

        /* TODO: 이미지, 파일 정보 추가 -> hashing */
        /* TODO: 작성자 정보 추가 (게시글, 댓글) */

        res.json({ board, commentList });
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
        if (error) {
            throw new Error('INVALID_PARAMETERS');
        }
        const { title, body, level } = value;

        const checkAuth = await hasAuth(userId);
        const checkRegularMember = await isRegularMember(userId);
        if (!checkAuth || (!checkRegularMember && level === 2)) {
            throw new Error('NO_AUTH');
        }

        const excerpt = body.substring(0, 150);

        /* ISSUE: 에러 발생하는 경우에 boardNo 증가하지 않도록 (빈 번호 없도록) 처리 필요 */
        await boards.create({
            title,
            body,
            excerpt,
            type: 'board',
            hit: 0,
            commentCount: 0,
            userUserNo: userId,
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
 *  @route PUT /api/board/:boardId
 *  @group Board
 *  @param {boardScheme.model} boardScheme.body.required - 작성할 글 정보
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} DELETED - already deleted
 *  @returns {Error} NO_AUTH - unauthorized
 */
const reviseBoard = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { boardId } = req.params;

        const { error, value } = boardScheme.validate(req.body);
        if (error) {
            throw new Error('INVALID_PARAMETERS');
        }
        const { title, body, level } = value;

        const checkExists = await existsBoard(boardId);
        if (!checkExists) {
            throw new Error('DELETED');
        }

        const checkWriter = await isWriterBoard(boardId, userId);
        if (!checkWriter) {
            throw new Error('NO_AUTH');
        }

        const checkAuth = await hasAuth(userId);
        const checkRegularMember = await isRegularMember(userId);
        if (!checkAuth || (!checkRegularMember && level === 2)) {
            throw new Error('NO_AUTH');
        }

        const excerpt = body.substring(0, 150);

        /* TODO: excerpt 처리 */
        await boards.update(
            { title, body, excerpt, level },
            { where: { boardNo: boardId } },
        );

        /* TODO: 이미지, 파일 정보 수정 (추가, 삭제) */
        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 *  boardId에 해당하는 글 삭제하기
 *  @route DELETE /api/board/:boardId
 *  @group Board
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} DELETED - already deleted
 *  @returns {Error} NO_AUTH - unauthorized
 */
const deleteBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const { userId } = req.query;

        const checkExists = await existsBoard(boardId);
        if (!checkExists) {
            throw new Error('DELETED');
        }

        const checkWriter = await isWriterBoard(boardId, userId);
        const checkAdmin = await isAdmin(userId);
        const checkAuth = await hasAuth(userId);
        if ((!checkWriter && !checkAdmin) || !checkAuth) {
            throw new Error('NO_AUTH');
        }

        await boards.destroy({ where: { boardNo: boardId } });

        /* TODO: 이미지, 파일 정보, 댓글 접근 불가능하도록 수정 */
        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 *  boardId에 해당하는 글 추천하기
 *  @route POST /api/board/:boardId/recommend
 *  @group Board
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} DELETED - already deleted
 *  @returns {Error} NO_AUTH - unauthorized
 */
const recommendBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const { userId } = req.query;

        const checkExists = await existsBoard(boardId);
        if (!checkExists) {
            throw new Error('DELETED');
        }

        const checkAuth = await hasAuth(userId);
        if (!checkAuth) {
            throw new Error('NO_AUTH');
        }

        /* TODO: 보기 권한과 동일한 권한 check 추가 */
        const checkRecommended = await recommendedBoard(boardId, userId);
        if (!checkRecommended) {
            /* 추천하지 않은 경우, 추천하기 */
            await recommendBoards.create({
                boardBoardNo: boardId,
                userUserNo: userId,
            });

            await boards.increment('recommendedTime', {
                by: 1,
                where: { boardNo: boardId },
                silent: true,
            });
        } else {
            /* 이미 추천한 경우, 추천 취소하기 */
            await recommendBoards.destroy({
                where: {
                    boardBoardNo: boardId,
                    userUserNo: userId,
                },
            });

            await boards.decrement('recommendedTime', {
                by: 1,
                where: { boardNo: boardId },
                silent: true,
            });
        }

        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 *  댓글 작성하기
 *  @route POST /api/board/:boardId/comment
 *  @group Board
 *  @param {commentScheme.model} commentScheme.body.required - 작성할 댓글 정보
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_AUTH - unauthorized
 *  @returns {Error} DELETED - already deleted
 */
const postComment = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { boardId } = req.params;

        const { error, value } = commentScheme.validate(req.body);
        if (error) {
            throw new Error('INVALID_PARAMETERS');
        }
        const { body } = value;

        const checkAuth = await hasAuth(userId);
        if (!checkAuth) {
            throw new Error('NO_AUTH');
        }

        /* TODO: 보기 권한과 동일한 권한 check 추가 */
        const checkExistsBoard = await existsBoard(boardId);
        if (!checkExistsBoard) {
            throw new Error('DELETED');
        }

        /* ISSUE: 중간 댓글을 삭제했을때, 번호 붙이기 오류 */
        const { commentCount } = await boards.findOne({
            where: { boardNo: boardId },
            raw: true,
        });

        await boardComments.create({
            body,
            recommendedTime: 0,
            userUserNo: userId,
            boardBoardNo: boardId,
            commentsNo: commentCount + 1,
        });

        await boards.increment('commentCount', {
            by: 1,
            where: { boardNo: boardId },
            silent: true,
        });

        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 *  댓글 수정하기
 *  @route PUT /api/board/:boardId/comment/:commentId
 *  @group Board
 *  @param {commentScheme.model} commentScheme.body.required - 작성할 댓글 정보
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_AUTH - unauthorized
 *  @returns {Error} DELETED - already deleted
 */
const reviseComment = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { boardId, commentId } = req.params;

        const { error, value } = commentScheme.validate(req.body);
        if (error) {
            throw new Error('INVALID_PARAMETERS');
        }
        const { body } = value;

        const checkExistsBoard = await existsBoard(boardId);
        const checkExistsComment = await existsComment(boardId, commentId);
        if (!checkExistsBoard || !checkExistsComment) {
            throw new Error('DELETED');
        }

        const checkWriter = await isWriterComment(commentId, userId);
        if (!checkWriter) {
            throw new Error('NO_AUTH');
        }

        /* TODO: 보기 권한과 동일한 권한 check 추가 */
        await boardComments.update(
            { body },
            { where: { boardCommentsNo: commentId } },
        );

        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 *  댓글 삭제하기
 *  @route DELETE /api/board/:boardId/comment/:commentId
 *  @group Board
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} DELETED - already deleted
 *  @returns {Error} NO_AUTH - unauthorized
 */
const deleteComment = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { boardId, commentId } = req.params;

        const checkExistsBoard = await existsBoard(boardId);
        const checkExistsComment = await existsComment(boardId, commentId);
        if (!checkExistsBoard || !checkExistsComment) {
            throw new Error('DELETED');
        }

        const checkWriter = await isWriterComment(commentId, userId);
        const checkAdmin = await isAdmin(userId);
        const checkAuth = await hasAuth(userId);
        if ((!checkWriter && !checkAdmin) || !checkAuth) {
            throw new Error('NO_AUTH');
        }

        await boardComments.destroy({ where: { boardCommentsNo: commentId } });

        await boards.decrement('commentCount', {
            by: 1,
            where: { boardNo: boardId },
            silent: true,
        });

        res.json({});
    } catch (err) {
        next(err);
    }
};

/**
 *  commentId에 해당하는 글 추천하기
 *  @route POST /api/board/:boardId/comment/:commentId/recommend
 *  @group Board
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} DELETED - already deleted
 *  @returns {Error} NO_AUTH - unauthorized
 */
const recommendComment = async (req, res, next) => {
    try {
        const { boardId, commentId } = req.params;
        const { userId } = req.query;

        const checkExistsBoard = await existsBoard(boardId);
        const checkExistsComment = await existsComment(boardId, commentId);
        if (!checkExistsBoard || !checkExistsComment) {
            throw new Error('DELETED');
        }

        const checkAuth = await hasAuth(userId);
        if (!checkAuth) {
            throw new Error('NO_AUTH');
        }

        /* TODO: 보기 권한과 동일한 권한 check 추가 */
        const checkRecommended = await recommendedComment(commentId, userId);
        if (!checkRecommended) {
            /* 추천하지 않은 경우, 추천하기 */
            await recommendComments.create({
                boardCommentBoardCommentsNo: commentId,
                userUserNo: userId,
            });

            await boardComments.increment('recommendedTime', {
                by: 1,
                where: { boardCommentsNo: commentId },
                silent: true,
            });
        } else {
            /* 이미 추천한 경우, 추천 취소하기 */
            await recommendComments.destroy({
                where: {
                    boardCommentBoardCommentsNo: commentId,
                    userUserNo: userId,
                },
            });

            await boardComments.decrement('recommendedTime', {
                by: 1,
                where: { boardCommentsNo: commentId },
                silent: true,
            });
        }

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
