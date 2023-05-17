const { gitDescribeSync } = require('git-describe');
const { version } = require('../package.json');
const { resolve, relative } = require('path');
const { writeFileSync } = require('fs-extra');

const gitInfo = gitDescribeSync({
  dirtyMark: false,
  dirtySemver: false,
});

gitInfo.version = version;
gitInfo.buildDate = new Date();
const file = resolve(__dirname, 'release-version.js');
const fileContent = `
// IMPORTANT: THIS FILE IS AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
/* tslint:disable */
export const VERSION = ${JSON.stringify(gitInfo, null, 4)};
/* tslint:enable */
`;

try {
  writeFileSync(file, fileContent, { encoding: 'utf-8' });
  // eslint-disable-next-line no-console
  console.log(`Wrote version info ${gitInfo.raw} to ${relative(resolve(__dirname), file)}`);
} catch (error) {
  console.error('Error writing version file:', error);
}
