module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('Users', {
        // Primary key
        userId: {
            field: 'user_id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        // 유저가 로그인 할 때 쓰는 ID
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 유저가 로그인 할 때 쓰는 PW
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 유저 권한: 0 | 1 | 2 | 999 / unauthorized | associate | regular | admin
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        // 실명
        realName: {
            type: DataTypes.STRING,
            allowNull: false,
        }
        // 별명
        nickName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 학교 이메일
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 회원가입 일자
        joinedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        }
        // 상태: 0 | 1 | 2 / 일반 | 탈퇴 | 강퇴
        state: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
    });

    return Users;
};
