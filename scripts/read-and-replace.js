const fs = require('fs'),
  log = require('../log')();

const readAndReplace = (from, replacement) => (
  new Promise(resolve => {
    fs.readFile(from, (err, data) => {
      if (err) {
        log.error(err);
        process.exit(6);
      }

      const reg = new RegExp('__directory__', 'g');
      const replaced = data.toString().replace(reg ,replacement);

      log.info(`Read from file [ ${from} ], and replaced placeholders with ${replacement}.`);
      // Return the replaced data.
      resolve(replaced);
    });

  })
);

module.exports = readAndReplace;