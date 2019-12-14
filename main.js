const commander = require('commander');
const program = new commander.Command();
const fs = require('fs');
const mkdir = require('./scripts/mkdir');
const chmod = require('./scripts/chmod');
const write = require('./scripts/write');
const readAndReplace = require('./scripts/read-and-replace');


program
  .version('0.0.1')
  .option('-d, --root-dir <path>', 'The path to start from.')
  .option('-s, --build-server', 'Build SSL cert data for the server.', true)
  .option('-c, --build-client', 'Build SSL cert data for the client.', false);
program.parse(process.argv);

// Set the program's variables
const {rootDir, buildServer, buildClient} = program;

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
const buildSslDirectory = async () => await mkdir(`${rootDir}/ssl`);
  
const buildRootCaStructure = async type => {
  await mkdir(`${rootDir}/ssl/${type}/ca`, true);
  //certs crl newcerts private
  await mkdir(`${rootDir}/ssl/${type}/ca/certs`);
  await mkdir(`${rootDir}/ssl/${type}/ca/crl`);
  await mkdir(`${rootDir}/ssl/${type}/ca/newcerts`);
  await mkdir(`${rootDir}/ssl/${type}/ca/private`);
  await chmod(`${rootDir}/ssl/${type}/ca/private`, 700);
  await write(`${rootDir}/ssl/${type}/ca/index.txt`, '');
  await write(`${rootDir}/ssl/${type}/ca/serial`, 1000);
  const opensslConfig = await readAndReplace('./configs/root.openssl.cnf', `${rootDir}/ssl/${type}/ca`);
  await write(`${rootDir}/ssl/${type}/ca/openssl.cnf`, opensslConfig);

};

const execute = () => {
  buildSslDirectory();
  if (buildServer) {
    buildRootCaStructure('server');
  }
}

execute();