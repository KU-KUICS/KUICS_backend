const { intros } = require('../../models');

/**
 * 소개 리스트를 가져옴
 * @route GET /api/intro
 * @group Intro
 * @returns {Array} 200 - 소개 리스트
 */
const getIntro = async (req, res, next) => {
    try {
        const introList = await intros.findAll();

        res.json({ introList });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getIntro,
};
