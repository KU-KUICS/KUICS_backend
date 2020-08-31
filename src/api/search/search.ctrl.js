const { Op } = require('sequelize');
const { boards } = require('../../models');
const { searchInputScheme } = require('../../lib/schemes');
const users = require('../../models/users');

/**
 * 검색 결과를 가져옴
 * @route GET /api/search
 * @group Search
 * @returns {Array} 200 - 검색 결과
 * @returns {Error} INVALID_PARAM - INVALID_PARAM
 */

const getSearchResult = async (req, res, next) => {
    try {
        const { error, value } = searchInputScheme.validate(req.query);
        if (error) throw new Error('INVALID_PARAM');

        const { title, body, duration, userName, tag } = value;

        const searchTitle = title ? `%${title}%` : '%';

        const searchBody = body ? `%${body}%` : '%';

        const searchDuration = duration
            ? [new Date(duration[0]), new Date(duration[1])]
            : [new Date('2020'), new Date(Date.now())]; // 처음 글은 최소 2020년 1월에 작성

        const searchUserName = userName ? `${userName}` : '%';

        const searchTag = tag ? `${tag}` : '%';

        const searchUserID = await users.findAll({
            attributes: ['userId'],
            where: {
                userName: searchUserName,
            },
        });

        const searchResult = await boards.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: searchTitle } },
                    { body: { [Op.like]: searchBody } },
                    {
                        createdAt: {
                            [Op.between]: [
                                searchDuration[0],
                                searchDuration[1],
                            ],
                        },
                    },
                    { userID: searchUserID }, // user와 board Join 구현 필요
                    { tag: searchTag }, // board에 아직 기능 추가 안 됨
                ],
            },
        });

        res.json({ searchResult });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getSearchResult,
};
