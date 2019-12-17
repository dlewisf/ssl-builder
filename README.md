# SSL Builder
A command line script that creates Certificate Authorities, Keys, and Certificates.
This is base off of this guide: [OpenSSL Certificate Authority](https://jamielinux.com/docs/openssl-certificate-authority/index.html)
### Installation
Clone this repo. Then run `npm install` to install dependencies.
```bash 
$ npm install
``` 
### Options
  Short name   | Long name         |  Description  |  Required  
 :----: | :------------- | ------------- | :----: 
 `-r`  |  `--root-dir <path>`  | The path to start from. | true    
 `-s`  | `--build-server` | Build a new SSL stack for the server | false   
 `-c`  | `--build-client` | Build a new SSL stack for the client | false   
 `-i`  | `--include-intermediate` | Create an intermediate CA | false   
 `-k`  | `--key-path <path>` | Set an existing key path | false
 `-e`  | `--new-cert <type>` | Create a new cert signed by an existing key | false
 
### Examples
Create new server side CA, Key and Cert files in the `/tmp` directory.
```
$ node main.js -sr /tmp
```

Create new server and client side CA, Intermediate CA, Key and Cert files in the `/tmp` directory.
```
$ node main.js -csir /tmp
```

