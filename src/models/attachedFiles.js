module.exports = (sequelize, DataTypes) => {
    const AttachedFile = sequelize.define('attachedFile', {
        fileNo: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    AttachedFile.associate = (models) => {
        AttachedFile.belongsTo(models.boards);
    };

    return AttachedFile;
};
