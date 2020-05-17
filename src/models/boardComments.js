module.exports = (sequelize, DataTypes) => {
    const boardComments = sequelize.define('boardComments', {
        boardCommentsNo: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        body: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        writtenAt: {
            type: DataTypes.DATE,
        },
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
