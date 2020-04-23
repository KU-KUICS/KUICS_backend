const mysql = require('mysql');
const { logger } = require('./logger');

const {
    MARIADB_HOST,
    MARIADB_USER,
    MARIADB_PASSWORD,
    MARIADB_PORT,
} = process.env;

const db = mysql.createConnection({
    host: MARIADB_HOST,
    user: MARIADB_USER,
    password: MARIADB_PASSWORD,
    port: MARIADB_PORT,
    database: 'kuics',
});

db.connect((error) => {
    if (error) {
        throw error;
    }
    logger.debug('DB Connection established');
});

module.exports = db;
