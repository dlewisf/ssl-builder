const commander = require('commander');
const program = new commander.Command();

const fs = require('fs');
const os = require('os');
const _package = require('./package');

const cleanSslDir = require('./scripts/clear-ssl-directory');


const buildKeyAndCert = require('./jobs/build-key-and-cert');
const buildRootCa = require('./jobs/build-root-ca');
const buildIntermediateCa = require('./jobs/build-intermediate-ca');

console.log(os.homedir());

program
  .version(_package.version)
  .option('-r, --root-dir <path>', 'The path to start from.', os.homedir())
  .option('-s, --build-server', 'Build a new SSL stack for the server.', false)
  .option('-c, --build-client', 'Build a new SSL stack for the client.', false)
  .option('-i, --include-intermediate', 'Create an intermediate CA.', false)
  .option('-k, --key-path <path>', 'Set the existing key path.', false)
  .option('-l, --log-level <level>', 'Set log level (NONE, ERROR, WARN, INFO, DEBUG and TRACE).', 'INFO')
  .option('-e, --new-cert <type>', 'Create a new cert signed by an existing key.', false);
program.parse(process.argv);

// Set the program's variables
const {rootDir, buildServer, buildClient, newCert, includeIntermediate, logLevel} = program;

// Setup log levels from command line.
const log = require('./log')(logLevel);

// Make sure the root directory is set and exists.
require('./scripts/root-directory')(rootDir);

const execute = async () => {
  // Clean that the SSL dir at the to of the script.
  if (fs.existsSync(`${rootDir}/ssl`)) await cleanSslDir(`${rootDir}/ssl`);
  
  if (buildServer) {
    log.header('----------------------------------------');
    log.header('------- Building SERVER Certs ----------');
    log.header('----------------------------------------');
    await buildRootCa('server');
    await buildIntermediateCa('server', includeIntermediate);
    await buildKeyAndCert('server');
  }
  if (buildClient) {
    log.header('----------------------------------------');
    log.header('------- Building CLIENT Certs ----------');
    log.header('----------------------------------------');
    await buildRootCa('client');
    await buildIntermediateCa('client', includeIntermediate);
    await buildKeyAndCert('client');
  }
  if (newCert) {
    log.header('----------------------------------------');
    log.header('---------- Sign Certs Only -------------');
    log.header('----------------------------------------');
    await buildKeyAndCert(newCert);
  }
  
  log.header('----------------------------------------');
  log.header('----------------- DONE -----------------');
  log.header('----------------------------------------');
  process.exit(0);
};

execute();
