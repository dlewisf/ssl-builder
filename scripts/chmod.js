const fs = require('fs'),
    chalk = require('chalk'),
    log = console.log;

const chmod = (file, access) => (
  new Promise(resolve => {
    fs.chmod(file, access, err => {
      if (err) {
        console.error(err);
        process.exit(4);
      }
      log(chalk.green(`Changed permissions for [ ${file} ] to ${chalk.bold(access)}`));
      resolve(true);
    })
  })
);

module.exports = chmod;