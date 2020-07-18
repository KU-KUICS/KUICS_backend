module.exports = (sequelize, DataTypes) => {
    const Solvers = sequelize.define('solvers', {
        // Priamry Key
        challengeNo: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    });

    Solvers.associate = (models) => {
        Solvers.belongsTo(models.users);
        Solvers.belongsTo(models.challenges);
    };

    return Solvers;
};
