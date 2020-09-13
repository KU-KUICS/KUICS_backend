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
const getListBoard = async (req, res, next) => {
    try {
        getListFunction(req, res, next, 'board');
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
        getFunction(req, res, next, 'board');
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
        recommendFunction(req, res, next, 'board');
    } catch (err) {
        next(err);
    }
};

/**
 * @typedef commentScheme
 * @property {string} body.required
 */

/**
 *  글에 대한 댓글 작성하기
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
        postCommentFunction(req, res, next, 'board');
    } catch (err) {
        next(err);
    }
};

/**
 *  글에 대한 댓글 수정하기
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
        reviseCommentFunction(req, res, next, 'board');
    } catch (err) {
        next(err);
    }
};

/**
 *  글에 대한 댓글 삭제하기
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
        deleteCommentFunction(req, res, next, 'board');
    } catch (err) {
        next(err);
    }
};

/**
 *  commentId에 해당하는 글의 댓글 추천하기
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
        recommendCommentFunction(req, res, next, 'board');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getListBoard,
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
