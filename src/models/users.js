module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('Users', {
        userId: {
            field: 'user_id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        state: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
    });

    return Users;
};
