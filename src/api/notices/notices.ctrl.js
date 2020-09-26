const {
    getListFunction,
    getFunction,
    recommendFunction,
    postCommentFunction,
    reviseCommentFunction,
    deleteCommentFunction,
    recommendCommentFunction,
} = require('../../lib/postingFunctions');

/**
 *  page에 해당하는 공지글 리스트 가져오기
 *  @route GET /api/notice/page/{page}
 *  @group Notice
 *  @param {number} page.path.required - 페이지 번호
 *  @param {number} count.query.optional - 글 개수
 *  @returns {Object} 200 - 글 리스트
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 */
const getListNotice = async (req, res, next) => {
    getListFunction(req, res, next, 'notice');
};

/**
 *  boardId에 해당하는 글 정보 가져오기
 *  @route GET /api/notice/{boardId}
 *  @group Notice
 *  @param {number} boardId.path.required - 글 번호
 *  @returns {Object, Array} 200 - 글 정보, 댓글 리스트
 *  @returns {Error} INVALID_PARAMETERS - invalid Parameters
 *  @returns {Error} NO_LOGIN - no login
 *  @returns {Error} NO_AUTH - unauthorized
 */
const getNotice = async (req, res, next) => {
    getFunction(req, res, next, 'notice');
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
    recommendFunction(req, res, next, 'notice');
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
    postCommentFunction(req, res, next, 'notice');
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
    reviseCommentFunction(req, res, next, 'notice');
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
    deleteCommentFunction(req, res, next, 'notice');
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
    recommendCommentFunction(req, res, next, 'notice');
};

module.exports = {
    getListNotice,
    getNotice,
    recommendNotice,
    postCommentNotice,
    reviseCommentNotice,
    deleteCommentNotice,
    recommendCommentNotice,
};
