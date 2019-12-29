const { spawn } = require('child_process'),
  log = require('../log')();

const opensslSignRootCert = (configPath, keyPath, certPath) => (
    new Promise(resolve => {
        const openssl = spawn('openssl', ['req', '-config', configPath, '-key', keyPath, '-new', '-x509', '-days', '7300', '-sha256', '-extensions', 'v3_ca', '-out', certPath]);

        openssl.stdout.on('data', (data) => { process.stderr.write(data.toString()); });
        openssl.stderr.on('data', (data) => { process.stderr.write(data.toString()); });
        process.stdin.pipe(openssl.stdin);

        openssl.on('close', (code) => {
            if (code>0) {
                log.error(`Failed at the openssl root CA signing step. Code: ${code}`);
                process.exit(code);
            }
            log.info(`Signed Root CA [ ${certPath} ]`);
            resolve(true);
        });
    })
);

module.exports = opensslSignRootCert;