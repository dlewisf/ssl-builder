const fs = require('fs'),
  log = require('../log')();

const concatChain = (rootCert, intermediateCert) => (
    new Promise(resolve => {
        log.debug('Creating a chain file.');
        const intermediate = fs.readFileSync(intermediateCert);
        const root = fs.readFileSync(rootCert);
        const chain = intermediate + root;

        log.info('Created chain from intermediateCert and the rootCert');
        resolve(chain);
    })
);

module.exports = concatChain;