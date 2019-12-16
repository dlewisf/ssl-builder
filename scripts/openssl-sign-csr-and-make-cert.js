const { spawn } = require('child_process');
const opensslSignCsrAndMakeCert = (rootConfigPath, csrPath, certPath, extensions) => (
    new Promise(resolve => {
        const openssl = spawn('openssl', ['ca', '-config', rootConfigPath, '-extensions', extensions, '-days', '3650', '-notext', '-md', 'sha256', '-in', csrPath, '-out', certPath], {
            stdio: ['inherit', 'pipe', 'pipe']
          });

        openssl.stdout.on('data', (data) => { process.stdout.write(data.toString()); });
        openssl.stderr.on('data', (data) => { process.stderr.write(data.toString()); });


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