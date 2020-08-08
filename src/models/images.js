module.exports = (sequelize, DataTypes) => {
    const Images = sequelize.define(
        'images',
        {
            // Primary Key
            imageId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            // 이미지 파일 위치
            path: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            // paranoid option
            paranoid: true,
        },
    );

    Images.associate = (models) => {
        // 이미지가 사용된 게시물
        Images.belongsTo(models.boards);
    };

    return Images;
};
