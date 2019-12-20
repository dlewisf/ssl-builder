const fs = require('fs'),
    chalk = require('chalk'),
    log = console.log;


const mkdir = (path, recursive=false) => (
  new Promise(resolve => {
    fs.mkdir(path, {recursive}, err => {
      if (err) {
        console.error(err);
        process.exit(3);
      }
      log(chalk.green(`Created directory at [ ${path} ]`));
      resolve(true);
    });
  })
);

module.exports = mkdir;