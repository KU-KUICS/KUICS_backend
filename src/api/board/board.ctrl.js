const getBoard = (req, res) => {
    const { user_id } = req.params;
    res.json({
        user_id,
    });
};

const postBoard = (req, res) => {
    const user_id = Number(req.body.user_id);
    if (user_id !== 10) {
        throw new Error('WRONG_USER_ID');
    }
    res.json({
        user_id,
    });
};

module.exports = {
    getBoard,
    postBoard,
};
