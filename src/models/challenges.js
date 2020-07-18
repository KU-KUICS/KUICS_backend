module.exports = (sequelize, DataTypes) => {
    const Chanllenges = sequelize.define('challenges', {
        // Priamry Key
        challengeNo: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // 문제 카테고리(PWN, WEB, ...)
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 점수
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // 제목
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 내용
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        // 푼 사람
        solvers: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    });

    Chanllenges.associate = (models) => {
        // 퍼스트 플러드
        Chanllenges.belongsTo(models.users);
    };

    return Chanllenges;
};
