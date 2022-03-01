import path = require('path');
import dotenv = require('dotenv');

dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
});
