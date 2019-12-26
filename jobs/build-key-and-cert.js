const buildRequiredDirectories = require('../jobs/build-required-directories'),
  getFilesByType = require('../jobs/files-by-type');

const rootDir = require('../scripts/root-directory')(),
  chmod = require('../scripts/chmod'),
  opensslGenKey = require('../scripts/openssl-gen-key'),
  opensslGenCsr = require('../scripts/openssl-gen-csr'),
  opensslSignCsrAndMakeCert = require('../scripts/openssl-sign-csr-and-make-cert'),
  opensslValidateCas = require('../scripts/openssl-validate-cas'),
  copyFile = require('../scripts/copy-file');

const buildKeyAndCert = async type => {
  await buildRequiredDirectories(rootDir);
  const {
    csr, cert, intermediateConfig, caChainCert, rootCACert, rootConfig,
    files, keyName, certName
  } = getFilesByType(type);
  let key = (keyPath) ? keyPath : getFilesByType(type).key;
  const config = (includeIntermediate) ? intermediateConfig : rootConfig;
  let chain = (includeIntermediate) ? caChainCert : rootCACert;
  
  await opensslGenKey(key);
  await copyFile(key, `${files}/${keyName}`);
  await chmod(key, '444');
  await opensslGenCsr(config, key, csr);
  const extension = type === 'server' ? 'server_cert' : 'usr_cert';
  await opensslSignCsrAndMakeCert(config, csr, cert, extension);
  await copyFile(cert, `${files}/${certName}`);
  await chmod(cert, '444');
  await opensslValidateCas(chain, cert);
};

module.exports = buildKeyAndCert;