module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('users', {
        userNo: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userPW: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        studentId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        joinedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        // 0: 미승인 | 1: 준회원 | 2: 정회원 | 999: 관리자
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        // 0: 정상 | 1: 탈퇴
        state: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            defaultValue: 0,
        },
    });

    return Users;
};
