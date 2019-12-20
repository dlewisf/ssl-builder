const { spawn } = require('child_process'),
    chalk = require('chalk'),
    log = console.log;

const opensslSignCert = (configPath, keyPath, certPath) => (
    new Promise(resolve => {
        log(chalk.blue('Signing a Cert'));
        const openssl = spawn('openssl', ['req', '-config', configPath, '-key', keyPath, '-new', '-x509', '-days', '7300', '-sha256', '-extensions', 'v3_ca', '-out', certPath], {
          stdio: ['inherit', 'pipe', 'pipe']
        });

        openssl.stdout.pipe(process.stdout);
        openssl.stderr.pipe(process.stderr);

        openssl.on('close', (code) => {
            if (code>0) {
                log(chalk.red(`Failed at the openssl root CA signing step. Code: ${code}`));
                process.exit(code);
            }
            log(chalk.green(`Signed Root CA [ ${certPath} ]`));
            resolve(true);
        });
    })
);

module.exports = opensslSignCert;