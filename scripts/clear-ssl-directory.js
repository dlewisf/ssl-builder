const { spawn } = require('child_process'),
	chalk = require('chalk'),
	log = console.log;

const cleanSslDir = sslDirPath => (
	new Promise(resolve => {
		log(chalk.blue('Removing the root SSL dir'));
		const rm = spawn('rm', ['-rf', sslDirPath]);

		rm.stdout.on('data', (data) => { process.stderr.write(data.toString()); });
		rm.stderr.on('data', (data) => { process.stderr.write(data.toString()); });

		rm.on('close', (code) => {
			if (code>0) {
				log(chalk.red(`Failed to remove [ ${sslDirPath} ] Error Code: ${code}`));
				process.exit(code);
			}
			log(chalk.green(`Removed data from [ ${sslDirPath} ]`));
			resolve(true);
		});
	})
);

module.exports = cleanSslDir;