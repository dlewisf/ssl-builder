const buildRequiredDirectories = require('../jobs/build-required-directories'),
  getFilesByType = require('../jobs/files-by-type');

const rootDir = require('../scripts/root-directory')(),
  mkdir = require('../scripts/mkdir'),
  chmod = require('../scripts/chmod'),
  write = require('../scripts/write'),
  readAndReplace = require('../scripts/read-and-replace'),
  opensslGenKey = require('../scripts/openssl-gen-key'),
  opensslSignCert = require('../scripts/openssl-sign-cert'),
  copyFile = require('../scripts/copy-file'),
  opensslValidateCert = require('../scripts/openssl-validate-cert');


const buildRootCa = async type => {
  await buildRequiredDirectories(rootDir);
  const {rootConfig, rootCAKey, rootCACert, files} = getFilesByType(type);
  
  await mkdir(`${rootDir}/ssl/${type}/ca`, true);
  await mkdir(`${rootDir}/ssl/${type}/ca/certs`);
  await mkdir(`${rootDir}/ssl/${type}/ca/crl`);
  await mkdir(`${rootDir}/ssl/${type}/ca/newcerts`);
  await mkdir(`${rootDir}/ssl/${type}/ca/private`);
  await chmod(`${rootDir}/ssl/${type}/ca/private`, '700');
  await write(`${rootDir}/ssl/${type}/ca/index.txt`, '');
  await write(`${rootDir}/ssl/${type}/ca/serial`, 1000);
  const opensslConfig = await readAndReplace('./configs/root.openssl.cnf', `${rootDir}/ssl/${type}/ca`);
  await write(rootConfig, opensslConfig);
  await opensslGenKey(rootCAKey);
  await chmod(rootCAKey, '400');
  await opensslSignCert(rootConfig, rootCAKey, rootCACert);
  await copyFile(rootCAKey, `${files}/ca.cert.pem`);
  await chmod(rootCACert, '444');
  await opensslValidateCert(rootCACert);
};

module.exports = buildRootCa;