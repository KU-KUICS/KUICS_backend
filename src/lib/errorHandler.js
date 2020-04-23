const exceptions = {
    INTERNAL_SERVER_ERROR: {
        statusCode: 500,
        errorCode: 0,
        msg: 'Internal Server Error',
    },
    WRONG_USER_ID: {
        statusCode: 404,
        errorCode: 10000,
        msg: 'Wrong user id',
    },
};

const handleError = (err, req, res, next) => {
    const errorName =
        err.message in exceptions ? err.message : 'INTERNAL_SERVER_ERROR';
    const { statusCode, errorCode, msg } = exceptions[errorName];

    res.status(statusCode).json({
        errorCode,
        msg: msg + (err.message in exceptions ? ` - ${err.message}` : ''),
    });

    next();
};

module.exports = handleError;
