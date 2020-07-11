module.exports = (sequelize, DataTypes) => {
    const AttachedFile = sequelize.define('attachedFile', {
        // Primary Key
        fileNo: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // 파일 위치
        path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    AttachedFile.associate = (models) => {
        // 파일이 첨부된 게시물
        AttachedFile.belongsTo(models.boards);
    };

    return AttachedFile;
};
