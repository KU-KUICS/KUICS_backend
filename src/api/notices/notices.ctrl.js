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

/** */
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
