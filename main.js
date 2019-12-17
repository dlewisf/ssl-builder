const commander = require('commander');
const program = new commander.Command();
const fs = require('fs');

const cleanSslDir = require('./scripts/clear-ssl-directory');
const copyFile = require('./scripts/copy-file');
const mkdir = require('./scripts/mkdir');
const chmod = require('./scripts/chmod');
const write = require('./scripts/write');
const readAndReplace = require('./scripts/read-and-replace');
const opensslGenKey = require('./scripts/openssl-gen-key');
const opensslSignCert = require('./scripts/openssl-sign-cert');
const opensslValidateCert = require('./scripts/openssl-validate-cert');
const opensslGenCsr = require('./scripts/openssl-gen-csr');
const opensslSignCsrAndMakeCert = require('./scripts/openssl-sign-csr-and-make-cert');
const opensslValidateCas = require('./scripts/openssl-validate-cas');
const concatChain = require('./scripts/concat-chain');


program
    .version('0.1.0')
    .requiredOption('-r, --root-dir <path>', 'The path to start from.')
    .option('-s, --build-server', 'Build a new SSL stack for the server.', false)
    .option('-c, --build-client', 'Build a new SSL stack for the client.', false)
    .option('-i, --include-intermediate', 'Create an intermediate CA.', false)
    .option('-k, --key-path <path>', 'Set the existing key path.', false)
    .option('-e, --new-cert <type>', 'Create a new cert signed by an existing key.', false);
program.parse(process.argv);

// Set the program's variables
const {rootDir, buildServer, buildClient, keyPath, newCert, includeIntermediate} = program;

// Make sure the root directory is set and exists.
if (!rootDir) {
  console.error('Please provide a starting directory.');
  process.exit(1);
} else if (!fs.existsSync(rootDir)) {
  console.error(`Unable to find directory at: ${rootDir}`);
  process.exit(2);
}

/**
 * Starting the scripting process.
 * **/
const buildRequiredDirectories = async () => {
  if (!fs.existsSync(`${rootDir}/ssl`)) {
    await mkdir(`${rootDir}/ssl`);
    await chmod(`${rootDir}/ssl`, '755');
  }
  if (!fs.existsSync(`${rootDir}/ssl/files`)) {
    await mkdir(`${rootDir}/ssl/files`);
    await chmod(`${rootDir}/ssl/files`, '755');
  }
};

/**
 * File paths
 */

const filePaths = type => {
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

const buildRootCaStructure = async type => {
  await buildRequiredDirectories();
  const {rootConfig, rootCAKey, rootCACert, files} = filePaths(type);

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

const buildIntermediateCaStructure = async type => {
  await buildRequiredDirectories();
  const {
    rootConfig, rootCACert, intermediateConfig, intermediateCAKey,
    intermediateCACsr, intermediateCACert, caChainCert, files
  } = filePaths(type);

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

const buildKeyAndCert = async type => {
  await buildRequiredDirectories();
  const {csr, cert, intermediateConfig, caChainCert, rootCACert, rootConfig,
      files, keyName, certName
  } = filePaths(type);
  let key = (keyPath) ? keyPath : filePaths(type).key;
  const config = (includeIntermediate) ? intermediateConfig : rootConfig;
  let chain = (includeIntermediate) ? caChainCert : rootCACert;

  await opensslGenKey(key);
  await copyFile(key, `${files}/${keyName}`);
  await chmod(key, '444');
  await opensslGenCsr(config, key, csr);
  const extension = type === 'server' ? 'server_cert': 'usr_cert';
  await opensslSignCsrAndMakeCert(config, csr, cert, extension);
  await copyFile(cert, `${files}/${certName}`);
  await chmod(cert, '444');
  await opensslValidateCas(chain, cert);
};


const execute = async () => {
  // Clean that the SSL dir at the to of the script.
  if (fs.existsSync(`${rootDir}/ssl`)) await cleanSslDir(`${rootDir}/ssl`);

  if (buildServer) {
    console.log('----------------------------------------');
    console.log('------- Building SERVER Certs ----------');
    console.log('----------------------------------------');
    await buildRootCaStructure('server');
    await buildIntermediateCaStructure('server');
    await buildKeyAndCert('server');
  }
  if (buildClient) {
    console.log('----------------------------------------');
    console.log('------- Building CLIENT Certs ----------');
    console.log('----------------------------------------');
    await buildRootCaStructure('client');
    await buildIntermediateCaStructure('client');
    await buildKeyAndCert('client');
  }
  if (newCert) {
    console.log('----------------------------------------');
    console.log('---------- Sign Certs Only -------------');
    console.log('----------------------------------------');
    await buildKeyAndCert(newCert);
  }

  console.log('----------------------------------------');
  console.log('----------------- DONE -----------------');
  console.log('----------------------------------------');
  process.exit(0);
};

execute();
