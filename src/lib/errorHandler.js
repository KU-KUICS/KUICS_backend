const { logger } = require('./logger');

const exceptions = {
    INTERNAL_SERVER_ERROR: {
        statusCode: 500,
        errorCode: 0,
        msg: 'Internal Server Error',
    },
    INVALID_PARAMETERS: {
        statusCode: 404,
        errorCode: 1,
        msg: 'Invalid Parameters',
    },
    NO_LOGIN: {
        statusCode: 403,
        errorCode: 3,
        msg: 'NO LOGIN',
    },
    NOT_KUICS: {
        statusCode: 403,
        errorCode: 2,
        msg: 'NOT MEMBER OF KUICS',
    },
    NOT_ADMIN: {
        statusCode: 403,
        errorCode: 4,
        msg: 'NOT ADMIN',
    },
    NO_AUTH: {
        statusCode: 401,
        errorCode: 10,
        msg: 'UNAUTHORIZED',
    },
};

const handleError = (err, req, res, next) => {
    const errorName =
        err.message in exceptions ? err.message : 'INTERNAL_SERVER_ERROR';
    const { statusCode, errorCode, msg } = exceptions[errorName];

    logger.error(
        `${msg} - ${
            err.message in exceptions ? err.message : 'NOT_DEFINED_ERROR'
        }`,
    );

    res.status(statusCode).json({
        errorCode,
        msg: msg + (err.message in exceptions ? ` - ${err.message}` : ''),
    });

    next();
};

module.exports = handleError;
