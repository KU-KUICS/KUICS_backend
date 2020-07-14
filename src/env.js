const dotenv = require('dotenv');
const path = require('path');

const { NODE_ENV } = process.env;

const filename = NODE_ENV === 'development' ? '.env.development' : '.env';

dotenv.config({ path: path.join(__dirname, `../${filename}`) });
