const { Op } = require('sequelize');
const { boards } = require('../../models');
const { searchInputScheme } = require('../../lib/schemes');

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

module.exports = {
    getSearchResult,
};
