const { spawn } = require('child_process');

const cleanSslDir = sslDirPath => (
	new Promise(resolve => {
		console.log('-- Removing the root SSL dir -- ');
		const rm = spawn('rm', ['-rf', sslDirPath]);

		rm.stdout.on('data', (data) => { process.stderr.write(data.toString()); });
		rm.stderr.on('data', (data) => { process.stderr.write(data.toString()); });

		rm.on('close', (code) => {
			if (code>0) {
				console.error(`Failed to remove [ ${sslDirPath} ] (Closing Code: ${code})`);
				process.exit(code);
			}
			console.log(` - Removed data from [ ${sslDirPath} ]`);
			resolve(true);
		});
	})
);

module.exports = cleanSslDir;