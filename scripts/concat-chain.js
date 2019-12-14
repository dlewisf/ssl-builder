const fs = require('fs');

const concatChain = (rootCert, intermediateCert) => (
    new Promise(resolve => {
        const intermediate = fs.readFileSync(intermediateCert);
        const root = fs.readFileSync(rootCert);
        const chain = intermediate + root;

        console.log('Created chain from intermediateCert and the rootCert');
        resolve(chain);
    })
);

module.exports = concatChain;