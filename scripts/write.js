const fs = require('fs'),
  log = require('../log')();

const write = (file, data) => (
  new Promise(resolve => {
    fs.writeFile(file, data, err => {
      if (err) {
        log.error(err);
        process.exit(5);
      }
      log.info(`Wrote file [ ${file} ]`);
      resolve(true);
    })
  })
);

module.exports = write;