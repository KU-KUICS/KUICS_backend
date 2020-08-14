module.exports = (sequelize, DataTypes) => {
    const Accusations = sequelize.define('accusations', {
        // Primary Key
        accusationId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // 0: 처리안됨 | 1: 처리됨
        state: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    });

    Accusations.associate = (models) => {
        // 신고자
        Accusations.belongsTo(models.users);

        // 신고된 게시물
        Accusations.belongsTo(models.boards);
        Accusations.belongsTo(models.boardComments);
    };

    return Accusations;
};
