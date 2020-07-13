const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');
const logger = require('../lib/logger');

dotenv.config({ path: path.join(__dirname, '../../.env.development') });

const basename = path.basename(__filename);
const config = process.env;
const db = {};

logger.debug(config);

const sequelize = new Sequelize(
    config.db_database,
    config.db_username,
    config.db_password,
    config,
);

fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js'
        );
    })
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(
            sequelize,
            Sequelize.DataTypes,
        );
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
