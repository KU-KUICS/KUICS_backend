module.exports = (sequelize, DataTypes) => {
    const boardComments = sequelize.define('boardComments', {
        // Primary Key
        boardCommentsNo: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // 내용
        body: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 작성날짜
        writtenAt: {
            type: DataTypes.DATE,
        },
        // 추천수
        recommendedTime: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    });

    boardComments.associate = (models) => {
        boardComments.belongsTo(models.users);
        boardComments.belongsTo(models.boards);
    };

    return boardComments;
};
