const fs = require('fs');

const chmod = (file, access) => (
  new Promise(resolve => {
    fs.chmod(file, access, err => {
      if (err) {
        console.error(err);
        process.exit(4);
      };
      console.log(` - Changed permissions for ${file} to ${access}.`);
      resolve(true);
    })
  })
);

module.exports = chmod;