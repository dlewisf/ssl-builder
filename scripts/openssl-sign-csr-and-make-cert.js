const { spawn } = require('child_process');
//openssl ca -config openssl.cnf -extensions v3_intermediate_ca -days 3650 -notext -md sha256 -in intermediate/csr/intermediate.csr.pem -out intermediate/certs/intermediate.cert.pem
const opensslSignCsrAndMakeCert = (rootConfigPath, csrPath, certPath, extensions) => (
    new Promise(resolve => {
        const openssl = spawn('openssl', ['ca', '-config', rootConfigPath, '-extensions', extensions, '-days', '3650', '-notext', '-md', 'sha256', '-in', csrPath, '-out', certPath]);

        openssl.stdout.on('data', (data) => { process.stderr.write(data.toString()); });
        openssl.stderr.on('data', (data) => { process.stderr.write(data.toString()); });
        process.stdin.pipe(openssl.stdin);

        openssl.on('close', (code) => {
            if (code>0) {
                console.error(`Failed at the openssl csr signing step. Code: ${code}`);
                process.exit(code);
            }
            console.log(` - Signed csr and make a cert: ${certPath} (Closing Code: ${code})`);
            resolve(true);
        });
    })
);

module.exports = opensslSignCsrAndMakeCert;