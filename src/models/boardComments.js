module.exports = (sequelize, DataTypes) => {
    const boardComments = sequelize.define(
        'boardComments',
        {
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
            // 추천수
            recommendedTime: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
        },
        {
            // paranoid option
            paranoid: true,
        },
    );

    boardComments.associate = (models) => {
        // 작성자
        boardComments.belongsTo(models.users);
        // 댓글이 작성된 게시물
        boardComments.belongsTo(models.boards);
    };

    return boardComments;
};
