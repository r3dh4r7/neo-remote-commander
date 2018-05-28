
# Neo Remote Commander


## Overview

Neo Remote Commander is a remote command execution tool that is based on pre-configured commands and utilises Neo GAS for invoking actions on NodeJS-compatible machines over the Neo blockchain.

The flexibility of this project makes it possible to utilise the [Neo Smart Economy Network](http://neo.org) to enable control of [IoT](https://en.wikipedia.org/wiki/Internet_of_things) (Internet of Things) devices without direct connections between client and host or middleware.

Commands are executed by sending GAS from any wallet to the wallet configured on the host machine. Command execution takes approximately average block time on the Neo blockchain, so it becomes faster as Neo scales to higher TPS.

A total of 100,000,000 unique commands can be invoked with just 1 GAS, which is never burnt, but rather sent back to the configured client wallet for immediate re-use.


## Requirements

### Host
* [Node.js](https://nodejs.org/en/)
* Internet
* A Neo wallet address with the corresponding private key

### Client
* A cryptocurrency wallet that can send and receive GAS
* As low as 0.00000001 GAS for executing one command


## Documentation

### Configuring the host

- Clone this repository:
    
    `git clone https://github.com/r3dh4r7/neo-remote-commander.git`
    
 - Enter the project folder:
    
    `cd neo-remote-commander`

- Fetch dependencies:
    
    `npm install`
    
- Edit *./config/app.json* with your favourite text editor. The settings are explained below:
 
  `network` - MainNet/TestNet
  
  `host` - Host specific configuration: wallet address, wallet private key and passphrase for encryption
  
  `client` - Client specific configuration: wallet address


### Defining commands

A numerical value of GAS is used to identify commands.

Commands are specified in JSON format, and all files with *.json* extension in *./config/commands* are auto-parsed.

### Running the host

- Make sure you have [Node.js](https://nodejs.org/en/) installed and can run it on the console.
    
- Enter bin directory:
     
     `cd bin`
     
- Running on *NIX:
     
     `./neo-remote-commander`

    If *command not found*, then run: `chmod +x neo-remote-commander`  and try again.

- Running on Windows:
     
     `neo-remote-commander`
     
     
    Options:
 
     -d, --delay [optional] => manually specify number of seconds between blockchain probes | default: 5
     
     -v --verbosity [optional] =>one of different verbosity levels: GAS, CMD, OUTPUT, ALL or QUIET | default: ALL

     -h | --help => view all command line args
     
     -v | --version => view version


### Remotely executing commands
From the client wallet specified in *./config/app.json*, send an amount of GAS to the host's wallet address (also specified in *./config/app.json*).

The amount of GAS you send should correspond to a pre-defined command. Example commands can be found in *./config/commands*

You can use an explorer to monitor the host wallet, see when the GAS shows up and see the relativity between command execution time in the terminal/console, and the blockchain probe delay setting.


## Components

### Host dependencies
Node.js and the following Node packages are required in the host:
- [request-promise](https://www.npmjs.com/package/request-promise)
- [date-and-time](https://www.npmjs.com/package/date-and-time)
- [chalk](https://www.npmjs.com/package/chalk)
- [commander](https://www.npmjs.com/package/commander)
- [@cityofzion/neon-js](https://github.com/CityOfZion/neon-js)
