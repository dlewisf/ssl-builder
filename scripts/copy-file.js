const fs = require('fs');

const copyFile = (source, target) => (
	new Promise(resolve => {
		fs.copyFile(source, target, (err) => {
			if (err) throw err;
			console.log(`[ ${source} ] was copied to [ ${target} ]`);
			resolve(true);
		});
	})
);

module.exports = copyFile;