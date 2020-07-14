const { Users } = require('../../models');
const { Boards } = require('../../models');

const getUser = async (req, res, next) => {};
const deleteUser = async (req, res, next) => {};
const postUserAuth = async (req, res, next) => {};
const postNotice = async (req, res, next) => {};
const postEditNotice = async (req, res, next) => {};
const deleteNotice = async (req, res, next) => {};

module.exports = {
    getUser,
    deleteUser,
    postUserAuth,
    postNotice,
    postEditNotice,
    deleteNotice,
};
