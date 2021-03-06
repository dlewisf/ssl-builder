const { spawn } = require('child_process'),
  log = require('../log')();

const opensslGenKey = keyPath => (
    new Promise(resolve => {
        log.debug('Generating a Key file');
        const openssl = spawn('openssl', ['genrsa', '-aes256', '-out', keyPath, '4096']);

        openssl.stdout.pipe(process.stdout);
        openssl.stderr.pipe(process.stderr);

        openssl.on('close', (code) => {
            if (code>0) {
                log.error(`Failed at the openssl key generation step. Code: ${code}`);
                process.exit(code);
            }
            log.info(`Created key at path [ ${keyPath} ]`);
            openssl.kill('SIGINT');
            resolve(true);
        });
    })
);

module.exports = opensslGenKey;