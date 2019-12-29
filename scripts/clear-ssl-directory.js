const { spawn } = require('child_process'),
	log = require('../log')();

const cleanSslDir = sslDirPath => (
	new Promise(resolve => {
		log.debug('Removing the root SSL dir');
		const rm = spawn('rm', ['-rf', sslDirPath]);

		rm.stdout.on('data', (data) => { process.stderr.write(data.toString()); });
		rm.stderr.on('data', (data) => { process.stderr.write(data.toString()); });

		rm.on('close', (code) => {
			if (code>0) {
				log.error(`Failed to remove [ ${sslDirPath} ] Error Code: ${code}`);
				process.exit(code);
			}
			log.info(`Removed data from [ ${sslDirPath} ]`);
			resolve(true);
		});
	})
);

module.exports = cleanSslDir;