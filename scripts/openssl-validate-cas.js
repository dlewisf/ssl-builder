const { spawn } = require('child_process');
//openssl verify -CAfile certs/ca.cert.pem intermediate/certs/intermediate.cert.pem
const opensslValidateCas = (rootCert, intermediateCert ) => (
    new Promise(resolve => {
        const openssl = spawn('openssl', ['verify', '-CAfile', rootCert, intermediateCert]);
        openssl.stdout.on('data', (data) => { process.stderr.write(data.toString()); });
        openssl.stderr.on('data', (data) => { process.stderr.write(data.toString()); });

        openssl.on('close', (code) => {
            if (code>0) {
                console.error(`Failed at the openssl CA validation step. Code: ${code}`);
                process.exit(code);
            }
            console.log(` - Validated Intermediate against Root CA: [ ${intermediateCert} ] - [ ${rootCert} ] (Closing Code: ${code})`);
            resolve(true);
        });
    })
);

module.exports = opensslValidateCas;