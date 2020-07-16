const Joi = require('@hapi/joi');
const { boards, boardComments, users } = require('../../models');

const titleScheme = Joi.string().min(3).required();
const bodyScheme = Joi.string().required();
const levelScheme = Joi.any().valid('0', '1', '2', '999').required();

const boardScheme = Joi.object({
    title: titleScheme,
    body: bodyScheme,
    level: levelScheme,
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

const getBoardList = async (req, res, next) => {
    try {
        const boardList = await boards.findAll({
            where: { type: 'board' },
            attributes: ['boardNo', 'title', 'hit', 'commentCount'],
            order: [['boardNo', 'DESC']],
        });

        res.json({ boardList });
    } catch (err) {
        next(err);
    }
    /* TODO: 미리보기 구현 */
    /* TODO: index별 구현 */
    /* TODO: 추천수 처리 */
};

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

        /* TODO: 추천수 처리 */
        const board = await boards.findAll({
            where: { boardNo: boardId },
            attributes: [
                'boardNo',
                'type',
                'title',
                'body',
                'hit',
                'commentCount',
                'level',
                'createdAt',
                'updatedAt',
                'userUserNo',
            ],
        });

        /* TODO: 삭제된 경우 미표시 */
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

        /* TODO: 이미지, 파일 정보 추가 */
        /* TODO: 작성자 정보 추가 (게시글, 댓글) */

        res.json({ board, commentList });
    } catch (err) {
        next(err);
    }
};

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

        /* ISSUE: 에러 발생하는 경우에 boardNo 증가하지 않도록 (빈 번호 없도록) 처리 필요 */
        const board = await boards.create({
            title,
            body,
            type: 'board',
            hit: 0,
            commentCount: 0,
            userUserNo: userId,
            level,
        });

        /* TODO: 이미지, 파일 정보 추가 */
        res.json({ board });
    } catch (err) {
        next(err);
    }
};

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

        await boards.update(
            { title, body, level },
            { where: { boardNo: boardId } },
        );

        /* TODO: 이미지, 파일 정보 수정 (추가, 삭제) */
        res.json({});
    } catch (err) {
        next(err);
    }
};

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

const recommendBoard = async (req, res, next) => {
    try {
        /* TODO: 글 추천 API 구현 */
    } catch (err) {
        next(err);
    }
};

const postComment = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { boardId } = req.params;
        const { body } = req.body;

        /* TODO: 권한 확인, 삭제 여부 확인, error handling */
        /* TODO: 원본 게시글 관련 처리 */
        await boardComments.create({
            body,
            recommendedTime: 0,
            userUserNo: userId,
            boardBoardNo: boardId,
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

const reviseComment = async (req, res, next) => {
    try {
        // const { userId } = req.query;
        const { /* boardId, */ commentId } = req.params;
        const { body } = req.body;

        /* TODO: boardId 확인 */
        /* TODO: 권한 확인, 삭제 여부 확인, error handling */
        await boardComments.update(
            { body },
            { where: { boardCommentsNo: commentId } },
        );

        res.json({});
    } catch (err) {
        next(err);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        // const { userId } = req.query;
        const { boardId, commentId } = req.params;

        /* TODO: boardId 확인 */
        /* TODO: 권한 확인, 삭제 여부 확인, error handling */
        /* 관리자 삭제 가능 */
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

const recommendComment = async (req, res, next) => {
    try {
        /* TODO: 댓글 추천 API 구현 */
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
