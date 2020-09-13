const { boards } = require('../models');

const { boardScheme } = require('./schemes');

const { checkUser, checkBoard } = require('./validations');

const postFunction = async (req, res, next, type) => {
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
            type,
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

const reviseFunction = async (req, res, next, type) => {
    try {
        const { userId } = req.query;
        const { boardId } = req.params;

        const { error, value } = boardScheme.validate(req.body);
        if (error) throw new Error('INVALID_PARAMETERS');
        const { title, body, level } = value;

        const user = await checkUser(userId);
        if (!user) throw new Error('INVALID_PARAMETERS');

        const { checkedId, userLevel } = user;

        const board = await checkBoard(boardId, type);
        if (!board) throw new Error('INVALID_PARAMETERS');

        const { writerBoardId } = board;

        const isWriterBoard = checkedId === writerBoardId;
        if (!isWriterBoard) throw new Error('NO_AUTH');

        const writeAuth = level <= userLevel;
        if (!writeAuth) throw new Error('NO_AUTH');

        const excerpt = body.join(' ').substring(0, 150);

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
module.exports = {
    postFunction,
    reviseFunction,
};
