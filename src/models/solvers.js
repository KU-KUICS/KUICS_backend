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
        Solvers.belongsTo(models.users, { onDelete: 'CASCADE' });
        Solvers.belongsTo(models.challenges, { onDelete: 'CASCADE' });
    };

    return Solvers;
};
