const { spawn } = require('child_process');

const opensslGenKey = keyPath => (
    new Promise(resolve => {
        console.log('-- Generating a Key file --');
        const openssl = spawn('openssl', ['genrsa', '-aes256', '-out', keyPath, '4096']);

        openssl.stdout.pipe(process.stdout);
        openssl.stderr.pipe(process.stderr);

        openssl.on('close', (code) => {
            if (code>0) {
                console.error(`Failed at the openssl key generation step. Code: ${code}`);
                process.exit(code);
            }
            console.log(` - Created key at path: ${keyPath}`);
            openssl.kill('SIGINT');
            resolve(true);
        });
      openssl.on('exit', function (code, signal) {
        console.log(`child process exited with code ${code} and signal ${signal}`);
      });
    })
);

module.exports = opensslGenKey;