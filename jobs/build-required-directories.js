const fs = require('fs'),
  mkdir = require('../scripts/mkdir'),
  chmod = require('../scripts/chmod');

const buildRequiredDirectories = async (rootDir) => {
  if (!fs.existsSync(`${rootDir}/ssl`)) {
    await mkdir(`${rootDir}/ssl`);
    await chmod(`${rootDir}/ssl`, '755');
  }
  if (!fs.existsSync(`${rootDir}/ssl/files`)) {
    await mkdir(`${rootDir}/ssl/files`);
    await chmod(`${rootDir}/ssl/files`, '755');
  }
};

module.exports = buildRequiredDirectories;