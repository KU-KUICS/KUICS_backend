const expressSwagger = require('express-swagger-generator');

const swaggerDefinition = {
    info: {
        title: 'KUICS_DEV API DOCS',
        version: '0.0.1',
    },
    host: 'localhost:4000',
    basePath: '/',
};

const swaggerOptions = {
    swaggerDefinition,
    basedir: __dirname,
    files: ['../api/**/*.js'],
};

const activateSwagger = (app) => {
    const startSwagger = expressSwagger(app);
    startSwagger(swaggerOptions);
};

module.exports = activateSwagger;
