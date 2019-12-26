const fs = require('fs');

function rootDirectory(dir) {
  if (!dir) {
    console.error('Please provide a starting directory.');
    process.exit(1);
  } else if (!fs.existsSync(dir)) {
    console.error(`Unable to find directory at: ${dir}`);
    process.exit(2);
  }
  return dir;
}

let instance = null;
// Root dir singleton.
module.exports = (rootDir) => {
  if (instance === null) instance = rootDirectory(rootDir);
  return instance;
};