/**
 * When running this app on a local machine, this script
 * checks for environment variables defined in .env.js
 */

const logger = require('winston');

try {
  var env = require('../.env.js');
  logger.info('loading .env.js');
  for (var key in env) {
    if (!(key in process.env))
      process.env[key] = env[key];
  }
} catch(ex) {
  logger.info('.env.js not found');
}
