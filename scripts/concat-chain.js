const fs = require('fs'),
    chalk = require('chalk'),
    log = console.log;

const concatChain = (rootCert, intermediateCert) => (
    new Promise(resolve => {
        log(chalk.blue('Creating a chain file.'));
        const intermediate = fs.readFileSync(intermediateCert);
        const root = fs.readFileSync(rootCert);
        const chain = intermediate + root;

        log(chalk.green('Created chain from intermediateCert and the rootCert'));
        resolve(chain);
    })
);

module.exports = concatChain;