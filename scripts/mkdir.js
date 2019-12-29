const fs = require('fs'),
  log = require('../log')();


const mkdir = (path, recursive=false) => (
  new Promise(resolve => {
    fs.mkdir(path, {recursive}, err => {
      if (err) {
        console.error(err);
        process.exit(3);
      }
      log.info(`Created directory at [ ${path} ]`);
      resolve(true);
    });
  })
);

module.exports = mkdir;