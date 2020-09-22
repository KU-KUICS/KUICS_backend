module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('users', {
        // Primary Key
        userId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // 사용자 이름
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 사용자 이메일
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 학번
        studentId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 가입일자
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
