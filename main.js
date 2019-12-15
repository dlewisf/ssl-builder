const commander = require('commander');
const program = new commander.Command();
const fs = require('fs');
const mkdir = require('./scripts/mkdir');
const chmod = require('./scripts/chmod');
const write = require('./scripts/write');
const readAndReplace = require('./scripts/read-and-replace');
const opensslGenKey = require('./scripts/openssl-gen-key');
const opensslSignRootCert = require('./scripts/openssl-sign-root-cert');
const opensslValidateCert = require('./scripts/openssl-validate-cert');
const opensslGenCsr = require('./scripts/openssl-gen-csr');
const opensslSignCsrAndMakeCert = require('./scripts/openssl-sign-csr-and-make-cert');
const opensslValidateCas = require('./scripts/openssl-validate-cas');
const concatChain = require('./scripts/concat-chain');


program
    .version('0.0.1')
    .option('-d, --root-dir <path>', 'The path to start from.')
    .option('-r, --build-server', 'Build a new SSL stack for the server.', false)
    .option('-t, --build-client', 'Build a new SSL stack for the client.', false)
    .option('-k, --key-path <path>', 'Set the existing key path.', false)
    .option('-c, --new-cert <type>', 'Create a new cert signed by an existing key.', false);
program.parse(process.argv);

// Set the program's variables
const {rootDir, buildServer, buildClient, keyPath, newCert} = program;

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
const buildSslDir = async () => {
  if (!fs.existsSync(`${rootDir}/ssl`)) {
    await mkdir(`${rootDir}/ssl`);
    await chmod(`${rootDir}/ssl`, '755');
  }
};

/**
 * File paths
 */

const filePaths = type => {
  const rootConfigPath = `${rootDir}/ssl/${type}/ca/openssl.cnf`;
  const rootCAKeyPath = `${rootDir}/ssl/${type}/ca/private/ca.key.pem`;
  const rootCACertPath = `${rootDir}/ssl/${type}/ca/certs/ca.cert.pem`;
  const intermediateConfigPath = `${rootDir}/ssl/${type}/ca/intermediate/openssl.cnf`;
  const intermediateCAKeyPath = `${rootDir}/ssl/${type}/ca/intermediate/private/intermediate.key.pem`;
  const intermediateCACsrPath = `${rootDir}/ssl/${type}/ca/intermediate/csr/intermediate.csr.pem`;
  const intermediateCACertPath = `${rootDir}/ssl/${type}/ca/intermediate/certs/intermediate.cert.pem`;
  const caChainCert = `${rootDir}/ssl/${type}/ca/intermediate/certs/ca-chain.cert.pem`;
  const key = `${rootDir}/ssl/${type}/ca/intermediate/private/${type}.key.pem`;
  const csr = `${rootDir}/ssl/${type}/ca/intermediate/csr/${type}.csr.pem`;
  const cert = `${rootDir}/ssl/${type}/ca/intermediate/certs/${type}.cert.pem`;
  return {
    rootConfigPath,
    rootCAKeyPath,
    rootCACertPath,
    intermediateConfigPath,
    intermediateCAKeyPath,
    intermediateCACsrPath,
    intermediateCACertPath,
    caChainCert,
    key,
    csr,
    cert
  }
};

const buildRootCaStructure = async type => {
  await buildSslDir();
  const {rootConfigPath, rootCAKeyPath, rootCACertPath} = filePaths(type);

  await mkdir(`${rootDir}/ssl/${type}/ca`, true);
  await mkdir(`${rootDir}/ssl/${type}/ca/certs`);
  await mkdir(`${rootDir}/ssl/${type}/ca/crl`);
  await mkdir(`${rootDir}/ssl/${type}/ca/newcerts`);
  await mkdir(`${rootDir}/ssl/${type}/ca/private`);
  await chmod(`${rootDir}/ssl/${type}/ca/private`, '700');
  await write(`${rootDir}/ssl/${type}/ca/index.txt`, '');
  await write(`${rootDir}/ssl/${type}/ca/serial`, 1000);
  const opensslConfig = await readAndReplace('./configs/root.openssl.cnf', `${rootDir}/ssl/${type}/ca`);
  await write(rootConfigPath, opensslConfig);
  await opensslGenKey(rootCAKeyPath);
  await chmod(rootCAKeyPath, '400');
  await opensslSignRootCert(rootConfigPath, rootCAKeyPath, rootCACertPath);
  await chmod(rootCACertPath, '444');
  await opensslValidateCert(rootCACertPath);
};

const buildIntermediateCaStructure = async type => {
  await buildSslDir();
  const {
    rootConfigPath, rootCACertPath, intermediateConfigPath, intermediateCAKeyPath,
    intermediateCACsrPath, intermediateCACertPath, caChainCert
  } = filePaths(type);

  await mkdir(`${rootDir}/ssl/${type}/ca/intermediate`);//certs crl csr newcerts private
  await mkdir(`${rootDir}/ssl/${type}/ca/intermediate/certs`);
  await mkdir(`${rootDir}/ssl/${type}/ca/intermediate/crl`);
  await mkdir(`${rootDir}/ssl/${type}/ca/intermediate/csr`);
  await mkdir(`${rootDir}/ssl/${type}/ca/intermediate/newcerts`);
  await mkdir(`${rootDir}/ssl/${type}/ca/intermediate/private`);
  await chmod(`${rootDir}/ssl/${type}/ca/intermediate/private`, '700');
  await write(`${rootDir}/ssl/${type}/ca/intermediate/index.txt`, '');
  await write(`${rootDir}/ssl/${type}/ca/intermediate/serial`, 1000);
  await write(`${rootDir}/ssl/${type}/ca/intermediate/crlnumber`, 1000);
  const opensslConfig = await readAndReplace('./configs/intermediate.openssl.cnf', `${rootDir}/ssl/${type}/ca/intermediate`);
  await write(intermediateConfigPath, opensslConfig);
  await opensslGenKey(intermediateCAKeyPath);
  await chmod(intermediateCAKeyPath, '400');
  await opensslGenCsr(intermediateConfigPath, intermediateCAKeyPath, intermediateCACsrPath);
  await opensslSignCsrAndMakeCert(rootConfigPath, intermediateCACsrPath, intermediateCACertPath, 'v3_intermediate_ca');
  await chmod(intermediateCACertPath, '444');
  await opensslValidateCert(intermediateCACertPath);
  await opensslValidateCas(rootCACertPath, intermediateCACertPath);
  const chain = await concatChain(rootCACertPath, intermediateCACertPath);
  await write(caChainCert, chain);
  await chmod(caChainCert, '444');
};

const buildKeyAndCert = async type => {
  await buildSslDir();
  const {csr, cert, intermediateConfigPath, caChainCert} = filePaths(type);
  let key = (keyPath) ? keyPath : filePaths(type).key;


  await opensslGenKey(key);
  await chmod(key, '444');
  await opensslGenCsr(intermediateConfigPath, key, csr);
  const extension = type === 'server' ? 'server_cert': 'usr_cert';
  await opensslSignCsrAndMakeCert(intermediateConfigPath, csr, cert, extension);
  await chmod(cert, '444');
  await opensslValidateCas(caChainCert, cert);

};

const execute = async () => {
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
