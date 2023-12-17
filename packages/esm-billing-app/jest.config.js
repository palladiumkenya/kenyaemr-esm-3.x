const rootConfig = require('../../jest.config.js');

const packageConfig = {
  ...rootConfig,
  collectCoverage: true,
};

module.exports = packageConfig;
