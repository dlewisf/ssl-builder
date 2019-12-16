const { spawn } = require('child_process');

const opensslSignCert = (configPath, keyPath, certPath) => (
    new Promise(resolve => {
        console.log('-- Signing a Cert --');
        const openssl = spawn('openssl', ['req', '-config', configPath, '-key', keyPath, '-new', '-x509', '-days', '7300', '-sha256', '-extensions', 'v3_ca', '-out', certPath], {
          stdio: ['inherit', 'pipe', 'pipe']
        });

        openssl.stdout.pipe(process.stdout);
        openssl.stderr.pipe(process.stderr);

        openssl.on('close', (code) => {
            if (code>0) {
                console.error(`Failed at the openssl root CA signing step. Code: ${code}`);
                process.exit(code);
            }
            console.log(` - Signed Root CA: ${certPath} (Closing Code: ${code})`);
            resolve(true);
        });

      openssl.on('exit', function (code, signal) {
        console.log(`child process exited with code ${code} and signal ${signal}`);
      });
    })
);

module.exports = opensslSignCert;