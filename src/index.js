const { logger } = require('./lib/logger');
require('./env');
const server = require('./server');

const { PORT } = process.env;

const port = PORT || 4000;

server.listen(port, () => {
    logger.debug(`Server listening on ${port}`);
});
