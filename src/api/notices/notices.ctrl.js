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
        getListFunction('notice');
    } catch (err) {
        next(err);
    }
};

/** */
const getNotice = async (req, res, next) => {
    try {
        getFunction('notice');
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
        recommendFunction('notice');
    } catch (err) {
        next(err);
    }
};

/** */
const postCommentNotice = async (req, res, next) => {
    try {
        postCommentFunction('notice');
    } catch (err) {
        next(err);
    }
};

/** */
const reviseCommentNotice = async (req, res, next) => {
    try {
        reviseCommentFunction('notice');
    } catch (err) {
        next(err);
    }
};

/** */
const deleteCommentNotice = async (req, res, next) => {
    try {
        deleteCommentFunction('notice');
    } catch (err) {
        next(err);
    }
};

/** */
const recommendCommentNotice = async (req, res, next) => {
    try {
        recommendCommentFunction('notice');
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
