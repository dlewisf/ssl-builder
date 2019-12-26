const buildRequiredDirectories = require('../jobs/build-required-directories'),
  getFilesByType = require('../jobs/files-by-type');

const rootDir = require('../scripts/root-directory')(),
  mkdir = require('../scripts/mkdir'),
  chmod = require('../scripts/chmod'),
  write = require('../scripts/write'),
  readAndReplace = require('../scripts/read-and-replace'),
  opensslGenKey = require('../scripts/openssl-gen-key'),
  opensslGenCsr = require('../scripts/openssl-gen-csr'),
  opensslSignCsrAndMakeCert = require('../scripts/openssl-sign-csr-and-make-cert'),
  opensslValidateCas = require('../scripts/openssl-validate-cas'),
  concatChain = require('../scripts/concat-chain'),
  copyFile = require('../scripts/copy-file'),
  opensslValidateCert = require('../scripts/openssl-validate-cert');


const buildIntermediateCa = async (type, includeIntermediate) => {
  await buildRequiredDirectories(rootDir);
  const {
    rootConfig, rootCACert, intermediateConfig, intermediateCAKey,
    intermediateCACsr, intermediateCACert, caChainCert, files
  } = getFilesByType(type);
  
  await mkdir(`${rootDir}/ssl/${type}/ca/intermediate`);
  await mkdir(`${rootDir}/ssl/${type}/ca/intermediate/certs`);
  await mkdir(`${rootDir}/ssl/${type}/ca/intermediate/crl`);
  await mkdir(`${rootDir}/ssl/${type}/ca/intermediate/csr`);
  await mkdir(`${rootDir}/ssl/${type}/ca/intermediate/newcerts`);
  await mkdir(`${rootDir}/ssl/${type}/ca/intermediate/private`);
  await chmod(`${rootDir}/ssl/${type}/ca/intermediate/private`, '700');
  await write(`${rootDir}/ssl/${type}/ca/intermediate/index.txt`, '');
  await write(`${rootDir}/ssl/${type}/ca/intermediate/serial`, 1000);
  await write(`${rootDir}/ssl/${type}/ca/intermediate/crlnumber`, 1000);
  if (includeIntermediate) {
    const opensslConfig = await readAndReplace('./configs/intermediate.openssl.cnf', `${rootDir}/ssl/${type}/ca/intermediate`);
    await write(intermediateConfig, opensslConfig);
    await opensslGenKey(intermediateCAKey);
    await chmod(intermediateCAKey, '400');
    await opensslGenCsr(intermediateConfig, intermediateCAKey, intermediateCACsr);
    await opensslSignCsrAndMakeCert(rootConfig, intermediateCACsr, intermediateCACert, 'v3_intermediate_ca');
    await copyFile(intermediateCACert, `${files}/intermediate.cert.pem`);
    await chmod(intermediateCACert, '444');
    await opensslValidateCert(intermediateCACert);
    await opensslValidateCas(rootCACert, intermediateCACert);
    const chain = await concatChain(rootCACert, intermediateCACert);
    await write(caChainCert, chain);
    await copyFile(caChainCert, `${files}/ca-chain.cert.pem`);
    await chmod(caChainCert, '444');
  }
};

module.exports = buildIntermediateCa;