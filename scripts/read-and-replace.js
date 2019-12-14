const fs = require('fs');

const readAndReplace = (from, replacement) => (
  new Promise(resolve => {
    fs.readFile(from, (err, data) => {
      if (err) {
        console.error(err);
        process.exit(6);
      };

      const reg = new RegExp('__directory__', 'g');
      const replaced = data.toString().replace(reg ,replacement);

      console.log(` - Read from file ${from}, and replaced placeholders with ${replacement}.`);
      // Return the replaced data.
      resolve(replaced);
    });

  })
);

module.exports = readAndReplace;