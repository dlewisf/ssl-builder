const fs = require('fs'),
    chalk = require('chalk'),
    log = console.log;

const write = (file, data) => (
  new Promise(resolve => {
    fs.writeFile(file, data, err => {
      if (err) {
        console.error(err);
        process.exit(5);
      }
      log(chalk.green(`Wrote file [ ${file} ]`));
      resolve(true);
    })
  })
);

module.exports = write;