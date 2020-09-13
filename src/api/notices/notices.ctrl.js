const {
    getListFunction,
    getFunction,
    recommendFunction,
    postCommentFunction,
    reviseCommentFunction,
    deleteCommentFunction,
    recommendCommentFunction,
} = require('../../lib/postingFunctions');

/** */
const getNoticeList = async (req, res, next) => {
    try {
        getListFunction(req, res, next, 'notice');
    } catch (err) {
        next(err);
    }
};

/** */
const getNotice = async (req, res, next) => {
    try {
        getFunction(req, res, next, 'notice');
    } catch (err) {
        next(err);
    }
};

/**
 *  boardId에 해당하는 공지글 추천하기
 *  @route POST /api/board/notice/{boardId}/recommend
 *  @group Notice
 *  @param {number} boardId.path.required - 글 번호
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const recommendNotice = async (req, res, next) => {
    try {
        recommendFunction(req, res, next, 'notice');
    } catch (err) {
        next(err);
    }
};

/**
 * @typedef commentScheme
 * @property {string} body.required
 */

/**
 *  공지글에 대한 댓글 작성하기
 *  @route POST /api/notice/{boardId}/comment
 *  @group Notice
 *  @param {number} boardId.path.required - 글 번호
 *  @param {commentScheme.model} commentScheme.body.required - 작성할 댓글 정보
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const postCommentNotice = async (req, res, next) => {
    try {
        postCommentFunction(req, res, next, 'notice');
    } catch (err) {
        next(err);
    }
};

/**
 *  공지글에 대한 댓글 수정하기
 *  @route PUT /api/notice/{boardId}/comment/{commentId}
 *  @group Notice
 *  @param {number} boardId.path.required - 글 번호
 *  @param {number} commentId.path.required - 댓글 번호
 *  @param {commentScheme.model} commentScheme.body.required - 작성할 댓글 정보
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const reviseCommentNotice = async (req, res, next) => {
    try {
        reviseCommentFunction(req, res, next, 'notice');
    } catch (err) {
        next(err);
    }
};

/**
 *  공지글에 대한 댓글 삭제하기
 *  @route DELETE /api/notice/{boardId}/comment/{commentId}
 *  @group Notice
 *  @param {number} boardId.path.required - 글 번호
 *  @param {number} commentId.path.required - 댓글 번호
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const deleteCommentNotice = async (req, res, next) => {
    try {
        deleteCommentFunction(req, res, next, 'notice');
    } catch (err) {
        next(err);
    }
};

/**
 *  commentId에 해당하는 공지글의 댓글 추천하기
 *  @route POST /api/notice/{boardId}/comment/{commentId}/recommend
 *  @group Notice
 *  @param {number} boardId.path.required - 글 번호
 *  @param {number} commentId.path.required - 댓글 번호
 *  @returns {Object} 200 - 빈 객체
 *  @returns {Error} INVALID_PARAMETERS - invalid parameters
 *  @returns {Error} NO_AUTH - unauthorized
 */
const recommendCommentNotice = async (req, res, next) => {
    try {
        recommendCommentFunction(req, res, next, 'notice');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getNoticeList,
    getNotice,
    recommendNotice,
    postCommentNotice,
    reviseCommentNotice,
    deleteCommentNotice,
    recommendCommentNotice,
};
