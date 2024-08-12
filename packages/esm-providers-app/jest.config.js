const rootConfig = require('../../jest.config.js');

const packageConfig = {
  ...rootConfig,
  collectCoverage: false,
};

module.exports = packageConfig;
