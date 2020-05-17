module.exports = (sequelize, DataTypes) => {
    const Boards = sequelize.define('boards', {
        boardNo: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        type: {
            type: DataTypes.STRING,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        hit: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        commentCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    });

    Boards.associate = (models) => {
        Boards.belongsTo(models.users);
    };

    return Boards;
};
