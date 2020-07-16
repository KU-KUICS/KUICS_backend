module.exports = (sequelize, DataTypes) => {
    const recommendBoards = sequelize.define('recommendBoards', {
        // Primary Key
        recommendBoards: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    });

    recommendBoards.associate = (models) => {
        // 추천인
        recommendBoards.belongsTo(models.users);
        // 추천된 게시물
        recommendBoards.belongsTo(models.boards);
    };

    return recommendBoards;
};
