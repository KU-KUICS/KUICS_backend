module.exports = (sequelize, DataTypes) => {
    const Chanllenges = sequelize.define('challenges', {
        // Priamry Key
        challId: {
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
            defaultValue: 500,
        },
        // 제목
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 내용
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        // 플래그
        flag: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // 푼 사람
        solvers: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    });

    Chanllenges.associate = (models) => {
        // 퍼스트 블러드
        Chanllenges.belongsTo(models.users, { onDelete: 'SET NULL' });
    };

    return Chanllenges;
};
