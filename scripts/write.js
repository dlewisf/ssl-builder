const fs = require('fs');

const write = (file, data) => (
  new Promise(resolve => {
    fs.writeFile(file, data, err => {
      if (err) {
        console.error(err);
        process.exit(5);
      };
      console.log(` - Wrote file ${file}.`);
      resolve(true);
    })
  })
);

module.exports = write;