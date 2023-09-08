const config = require('openmrs/default-webpack-config');
config.scriptRuleConfig.exclude = /node_modules(?![\/\\]@openmrs)/;
// this is a CommonJS module
module.exports = config;
