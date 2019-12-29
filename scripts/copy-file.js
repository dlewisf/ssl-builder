const fs = require('fs'),
	log = require('../log')();

const copyFile = (source, target) => (
	new Promise(resolve => {
		fs.copyFile(source, target, (err) => {
			if (err) throw err;
			log.info(`[ ${source} ] was copied to [ ${target} ]`);
			resolve(true);
		});
	})
);

module.exports = copyFile;