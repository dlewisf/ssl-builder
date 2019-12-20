const { spawn } = require('child_process'),
    chalk = require('chalk'),
    log = console.log;

const opensslGenCsr = (configPath, keyPath, csrPath) => (
    new Promise(resolve => {
        log(chalk.blue('Generating a Csr file'));
        const openssl = spawn('openssl', ['req', '-config', configPath, '-new', '-sha256', '-key', keyPath, '-out', csrPath], {
        stdio: ['inherit', 'pipe', 'pipe']
      });

        // process.stdin.pipe(openssl.stdin);
        openssl.stdout.on('data', (data) => { process.stderr.write(data.toString()); });
        openssl.stderr.on('data', (data) => { process.stderr.write(data.toString()); });

        openssl.on('close', (code) => {
            if (code>0) {
                log(chalk.red(`Failed at the openssl Intermediate CA csr step. Code: ${code}`));
                process.exit(code);
            }
            log(chalk.green(`Created csr from the Intermediate CA [ ${csrPath} ]`));
            resolve(true);
        });
    })
);

module.exports = opensslGenCsr;