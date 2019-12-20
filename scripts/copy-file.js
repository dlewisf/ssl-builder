const fs = require('fs'),
	chalk = require('chalk'),
	log = console.log;

const copyFile = (source, target) => (
	new Promise(resolve => {
		fs.copyFile(source, target, (err) => {
			if (err) throw err;
			log(chalk.green(`[ ${source} ] was copied to [ ${target} ]`));
			resolve(true);
		});
	})
);

module.exports = copyFile;