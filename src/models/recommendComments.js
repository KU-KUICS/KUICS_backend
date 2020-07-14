module.exports = (sequelize, DataTypes) => {
    const recommendComments = sequelize.define('recommendComments', {
        // Primary Key
        recommendComments: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    });

    recommendComments.associate = (models) => {
        // 추천인
        recommendComments.belongsTo(models.users);
        // 추천된 댓글
        recommendComments.belongsTo(models.boards);
    };

    return recommendComments;
};
