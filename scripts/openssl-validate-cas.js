const { spawn } = require('child_process'),
  log = require('../log')();

const opensslValidateCas = (rootCert, intermediateCert ) => (
    new Promise(resolve => {
        const openssl = spawn('openssl', ['verify', '-CAfile', rootCert, intermediateCert]);
        openssl.stdout.on('data', (data) => { process.stderr.write(data.toString()); });
        openssl.stderr.on('data', (data) => { process.stderr.write(data.toString()); });

        openssl.on('close', (code) => {
            if (code>0) {
                log.error(`Failed at the openssl CA validation step. Code: ${code}`);
                process.exit(code);
            }
            log.info(`Validated Intermediate against Root CA: [ ${intermediateCert} ] - [ ${rootCert} ]`);
            resolve(true);
        });
    })
);

module.exports = opensslValidateCas;