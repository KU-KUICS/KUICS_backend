module.exports = (sequelize, DataTypes) => {
    const AttachedFile = sequelize.define(
        'attachedFile',
        {
            // Primary Key
            fileNo: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            fileName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            // 파일 위치
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

    AttachedFile.associate = (models) => {
        // 파일이 첨부된 게시물
        AttachedFile.belongsTo(models.boards);
        AttachedFile.belongsTo(models.challenges);
    };

    return AttachedFile;
};
