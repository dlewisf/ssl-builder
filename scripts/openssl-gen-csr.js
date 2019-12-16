const { spawn } = require('child_process');

//openssl req -config intermediate/openssl.cnf -new -sha256 -key intermediate/private/intermediate.key.pem -out intermediate/csr/intermediate.csr.pem
const opensslGenCsr = (configPath, keyPath, csrPath) => (
    new Promise(resolve => {
        console.log('-- Generating a Csr file. --');
        const openssl = spawn('openssl', ['req', '-config', configPath, '-new', '-sha256', '-key', keyPath, '-out', csrPath], {
        stdio: ['inherit', 'pipe', 'pipe']
      });

        // process.stdin.pipe(openssl.stdin);
        openssl.stdout.on('data', (data) => { process.stderr.write(data.toString()); });
        openssl.stderr.on('data', (data) => { process.stderr.write(data.toString()); });

        openssl.on('close', (code) => {
            if (code>0) {
                console.error(`Failed at the openssl Intermediate CA csr step. Code: ${code}`);
                process.exit(code);
            }
            console.log(` - Created csr from the Intermediate CA: ${csrPath} (Closing Code: ${code})`);
            resolve(true);
        });
    })
);

module.exports = opensslGenCsr;