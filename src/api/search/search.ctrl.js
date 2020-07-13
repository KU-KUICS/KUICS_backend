const Joi = require('@hapi/joi');
const { Op } = require('sequelize');

const { boards } = require('../../models');

const searchKeyScheme = Joi.string().min(3).required();
const searchTargetScheme = Joi.string()
    .valid('title', 'body', 'titleAndBody')
    .required();

const searchInputScheme = Joi.object({
    key: searchKeyScheme,
    target: searchTargetScheme,
});

const getSearchResult = async (req, res, next) => {
    try {
        const { err, value } = searchInputScheme.validate(req.query);
        if (err) throw new Error('INVALID_PARAM');

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
