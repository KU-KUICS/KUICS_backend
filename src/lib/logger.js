const { createLogger, format, transports, config } = require('winston');
require('winston-syslog');
require('winston-daily-rotate-file');

const { combine, timestamp, printf } = format;
const { NODE_ENV } = process.env;

const LOG_DIR = `${__dirname}/../../log`;

// eslint-disable-next-line no-shadow
const loggerFormat = printf(({ level, message, timestamp }) => {
    return `${level.toUpperCase()} ${timestamp} : ${message}`;
});

const transport = [];

if (NODE_ENV === 'production') {
    const dailyRotateFileTransport = new transports.DailyRotateFile({
        filename: `${LOG_DIR}/%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        handleExceptions: true,
        level: 'debug',
        maxFiles: '7d',
    });

    const errorFileTransport = new transports.DailyRotateFile({
        filename: `${LOG_DIR}/error_%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        handleExceptions: true,
        level: 'error',
        maxFiles: '14d',
    });

    transport.push(dailyRotateFileTransport, errorFileTransport);
} else {
    const showInConsole = new transports.Console({
        handleExceptions: true,
        level: 'debug',
        format: format.colorize({
            all: true,
        }),
    });
    transport.push(showInConsole);
}

const logger = createLogger({
    level: config.syslog.levels,
    format: combine(timestamp(), loggerFormat),
    transports: transport,
    exitOnError: false,
});

const stream = {
    write: (message) => {
        logger.info(message);
    },
};

module.exports = {
    logger,
    stream,
};
