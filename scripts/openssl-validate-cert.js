const { spawn } = require('child_process');

const opensslValidateCert = certPath => (
    new Promise(resolve => {
        const openssl = spawn('openssl', ['x509', '-noout', '-text', '-in', certPath]);
        openssl.stdout.on('data', (data) => { process.stderr.write(data.toString()); });
        openssl.stderr.on('data', (data) => { process.stderr.write(data.toString()); });

        openssl.on('close', (code) => {
            if (code>0) {
                console.error(`Failed at the openssl root CA validation step. Code: ${code}`);
                process.exit(code);
            }
            console.log(` - Validated Root CA: ${certPath} (Closing Code: ${code})`);
            resolve(true);
        });
    })
);

module.exports = opensslValidateCert;