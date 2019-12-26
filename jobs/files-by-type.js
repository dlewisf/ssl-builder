const rootDir = require('../scripts/root-directory')();

const getFilesByType = type => {
  const rootConfig = `${rootDir}/ssl/${type}/ca/openssl.cnf`;
  const rootCAKey = `${rootDir}/ssl/${type}/ca/private/ca.key.pem`;
  const rootCACert = `${rootDir}/ssl/${type}/ca/certs/ca.cert.pem`;
  const intermediateConfig = `${rootDir}/ssl/${type}/ca/intermediate/openssl.cnf`;
  const intermediateCAKey = `${rootDir}/ssl/${type}/ca/intermediate/private/intermediate.key.pem`;
  const intermediateCACsr = `${rootDir}/ssl/${type}/ca/intermediate/csr/intermediate.csr.pem`;
  const intermediateCACert = `${rootDir}/ssl/${type}/ca/intermediate/certs/intermediate.cert.pem`;
  const caChainCert = `${rootDir}/ssl/${type}/ca/intermediate/certs/ca-chain.cert.pem`;
  const keyName = `${type}.key.pem`;
  const csrName = `${type}.csr.pem`;
  const certName = `${type}.cert.pem`;
  const key = `${rootDir}/ssl/${type}/ca/intermediate/private/${keyName}`;
  const csr = `${rootDir}/ssl/${type}/ca/intermediate/csr/${csrName}`;
  const cert = `${rootDir}/ssl/${type}/ca/intermediate/certs/${certName}`;
  const files = `${rootDir}/ssl/files`;
  return {
    rootConfig,
    rootCAKey,
    rootCACert,
    intermediateConfig,
    intermediateCAKey,
    intermediateCACsr,
    intermediateCACert,
    caChainCert,
    key,
    keyName,
    csr,
    csrName,
    cert,
    certName,
    files
  }
};

module.exports = getFilesByType;