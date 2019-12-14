const fs = require('fs');

const mkdir = (path, recursive=false) => (
  new Promise(resolve => {
    fs.mkdir(path, {recursive}, err => {
      if (err) {
        console.error(err);
        process.exit(3);
      };
      console.log(` - Created directory at: ${path}`);
      resolve(true);
    });
  })
)

module.exports = mkdir;