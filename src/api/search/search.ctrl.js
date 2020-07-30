const Joi = require('@hapi/joi');
const { Op } = require('sequelize');

// const { valid } = require('@hapi/joi');
const { boards } = require('../../models');

/*
const searchKeyScheme = Joi.string().min(3).required();
const searchTargetScheme = Joi.string()
    .valid('title', 'body', 'titleAndBody')
    .required();

const searchInputScheme = Joi.object({
    key: searchKeyScheme,
    target: searchTargetScheme,
});
*/
const searchKeyScheme = Joi.string();
const searchDurationScheme = Joi.array[2]; // 구조 변경 필요 - from to 나눠서?

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

/*
const getSearchResult = async (req, res, next) => {
    try {
        const { error, value } = searchInputScheme.validate(req.query);
        if (error) throw new Error('INVALID_PARAM');

        const { key, target } = value;

        let searchTitle;
        let searchBody;

        switch (target) {
            case 'title':
                searchTitle = `%${key}%`;
                searchBody = '';
                break;
            case 'body':
                searchTitle = '';
                searchBody = `%${key}%`;
                break;
            case 'titleAndBody':
                searchTitle = `%${key}%`;
                searchBody = `%${key}%`;
                break;
            default:
                searchTitle = '%%%';
                searchBody = '%%%';
                break;
        }

        const searchResult = await boards.findAll({
            where: {
                [Op.or]: {
                    title: {
                        [Op.like]: searchTitle,
                    },
                    body: {
                        [Op.like]: searchBody,
                    },
                },
            },
        });

        res.json({ searchResult });
    } catch (err) {
        next(err);
    }
};
*/

const getSearchResult = async (req, res, next) => {
    try {
        const { error, value } = searchInputScheme.validate(req.query);
        if (error) throw new Error('INVALID_PARAM');

        const { title, body, duration, userName, tag } = value;

        let searchTitle;
        if (title) {
            searchTitle = `%${title}%`;
        } else {
            searchTitle = `%%%`;
        }

        let searchBody;
        if (body) {
            searchBody = `%${body}%`;
        } else {
            searchBody = `%%%`;
        }

        /*
        let searchDuration.array;
        if (duration) {
            searchDurationFrom = duration.array[0];
        } else {
            searchDurationFrom = 0;
            searchDurationTo = MAX;
        }
        */

        let searchUserName;
        if (userName) {
            searchUserName = `${userName}`;
        } else {
            searchUserName = `%%%`;
        }

        let searchTag;
        if (searchTag) {
            searchTag = `${tag}`;
        } else {
            searchTag = '%%%';
        }

        const searchResult = await boards.findAll({
            where: {
                [Op.or]: {
                    title: {
                        [Op.like]: searchTitle,
                    },
                    body: {
                        [Op.like]: searchBody,
                    },
                    userName: searchUserName,
                    tag: searchTag,
                },
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
