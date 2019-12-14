const { spawn } = require('child_process');

const opensslSignRootCert = (configPath, keyPath, certPath) => (
    new Promise(resolve => {
        const openssl = spawn('openssl', ['req', '-config', configPath, '-key', keyPath, '-new', '-x509', '-days', '7300', '-sha256', '-extensions', 'v3_ca', '-out', certPath]);

        openssl.stdout.on('data', (data) => { process.stderr.write(data.toString()); });
        openssl.stderr.on('data', (data) => { process.stderr.write(data.toString()); });
        process.stdin.pipe(openssl.stdin);

        openssl.on('close', (code) => {
            if (code>0) {
                console.error(`Failed at the openssl root CA signing step. Code: ${code}`);
                process.exit(code);
            }
            console.log(` - Signed Root CA: ${certPath} (Closing Code: ${code})`);
            resolve(true);
        });
    })
);

module.exports = opensslSignRootCert;