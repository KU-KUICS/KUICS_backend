module.exports = (sequelize, DataTypes) => {
    const Images = sequelize.define('images', {
        imageNo: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Images.associate = (models) => {
        Images.belongsTo(models.boards);
    };

    return Images;
};
