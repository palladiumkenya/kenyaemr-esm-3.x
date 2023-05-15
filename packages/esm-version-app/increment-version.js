const fs = require('fs');

// Read the package.json file
const packageJsonPath = './package.json';
const packageJson = require(packageJsonPath);

// Increment the version
const [major, minor, patch] = packageJson.version.split('.').map(Number);
const newVersion = `${major}.${minor}.${patch + 1}`;

// Update the package.json file with the new version
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// eslint-disable-next-line no-console
console.log(`Version incremented to ${newVersion}`);
