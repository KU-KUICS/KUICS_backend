const dotenv = require('dotenv');
const path = require('path');

const { NODE_ENV } = process.env;

dotenv.config({
    path: path.resolve(
        process.cwd(),
        NODE_ENV === 'production' ? '.env' : '.env.development',
    ),
});
