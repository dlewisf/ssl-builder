const { spawn } = require('child_process');

const opensslGenKey = keyPath => (
    new Promise(resolve => {
        const openssl = spawn('openssl', ['genrsa', '-aes256', '-out', keyPath, '4096']);

        openssl.stdout.on('data', (data) => process.stdout.write(data.toString()));

        openssl.stderr.on('data', (data) => process.stderr.write(data.toString()));

        openssl.on('close', (code) => {
            if (code>0) {
                console.error(`Failed at the openssl key generation step. Code: ${code}`);
                process.exit(code);
            }
            console.log(` - Created key at path: ${keyPath} (Closing Code: ${code})`);
            resolve(true);
        });
    })
);

module.exports = opensslGenKey;