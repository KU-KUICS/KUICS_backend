module.exports = (sequelize, DataTypes) => {
    const Solvers = sequelize.define('solvers', {
        // Priamry Key
        solverId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    });

    Solvers.associate = (models) => {
        // 사용자는 삭제되지 않기 때문에 CASCADE 적용 안함
        Solvers.belongsTo(models.users);
        Solvers.belongsTo(models.challenges, { onDelete: 'CASCADE' });
    };

    return Solvers;
};
