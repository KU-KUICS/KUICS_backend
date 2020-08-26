const Joi = require('@hapi/joi');
const { Op } = require('sequelize');

const { boards } = require('../../models');

const searchKeyScheme = Joi.string();
const searchDurationScheme = Joi.array().items(Joi.string());

const searchInputScheme = Joi.object({
    title: searchKeyScheme,
    body: searchKeyScheme,
    duration: searchDurationScheme,
    userName: searchKeyScheme,
    tag: searchKeyScheme,
});

/**
 * 검색 결과를 가져옴
 * @route GET /api/search
 * @group Search
 * @param {string} key.query.required - 검색 키워드
 * @param {string} target.query.required - 검색 타겟(title, body, titleAndBody)
 * @returns {Array} 200 - 검색 결과
 * @returns {Error} INVALID_PARAM - INVALID_PARAM
 */

const getSearchResult = async (req, res, next) => {
    try {
        const { error, value } = searchInputScheme.validate(req.query);
        if (error) throw new Error('INVALID_PARAM');

        const { title, body, duration, userName, tag } = value;

        const searchTitle = title ? `%${title}%` : ' ';

        const searchBody = body ? `%${body}%` : ' ';

        const searchDuration = duration
            ? [new Date(duration[0]), new Date(duration[1])]
            : undefined;

        const searchUserName = userName ? `${userName}` : ' ';

        const searchTag = tag ? `${tag}` : ' ';

        const searchResult = await boards.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: searchTitle } },
                    { body: { [Op.like]: searchBody } },
                    {
                        duration: {
                            [Op.between]: [
                                searchDuration[0],
                                searchDuration[1],
                            ],
                        },
                    },
                    { userName: searchUserName },
                    { tag: searchTag },
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
