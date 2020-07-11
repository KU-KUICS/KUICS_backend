const { logger } = require('./lib/logger');
const server = require('./server');

const { PORT } = require('../config/config.json');

const port = PORT || 4000;

server.listen(port, () => {
    logger.debug(`Server listening on ${port}`);
});
