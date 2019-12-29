const { spawn } = require('child_process'),
  log = require('../log')();

const opensslSignCert = (configPath, keyPath, certPath) => (
    new Promise(resolve => {
        log.debug('Signing a Cert');
        const openssl = spawn('openssl', ['req', '-config', configPath, '-key', keyPath, '-new', '-x509', '-days', '7300', '-sha256', '-extensions', 'v3_ca', '-out', certPath], {
          stdio: ['inherit', 'pipe', 'pipe']
        });

        openssl.stdout.pipe(process.stdout);
        openssl.stderr.pipe(process.stderr);

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

module.exports = opensslSignCert;