
# Neo Remote Commander


## Overview

Neo Remote Commander is a remote command execution tool that is based on pre-configured commands and utilises Neo GAS for invoking actions on NodeJS-compatible machines over the Neo blockchain.

The flexibility of this project makes it possible to utilise the [Neo Smart Economy Network](http://neo.org) to enable control of [IoT](https://en.wikipedia.org/wiki/Internet_of_things) (Internet of Things) devices without direct connections between client and host or middleware.

Commands are executed by sending GAS to self (same wallet). The wallet address must be specified on the host. Command execution takes approximately average block time on the Neo blockchain, so it becomes faster as Neo scales to higher TPS.

A total of 100,000,000 unique commands can be invoked with just 1 GAS, which is never burnt, but rather retained for immediate re-use.


## Requirements

### Host
* [Node.js](https://nodejs.org/en/)
* Internet
* A Neo wallet address with some GAS

### Client
* A cryptocurrency wallet that can send and receive GAS
* As low as 0.00000001 GAS for executing one command


## Documentation

### Configuring the host

- [Download](https://github.com/r3dh4r7/neo-remote-commander/archive/master.zip) this repository and unzip it.
    
 - Enter the project folder:
    
    `cd neo-remote-commander`

- Fetch dependencies:
    
    `npm install`
    
- Edit *./config/app.json* with your favourite text editor. The settings are explained below:
 
  `network` - MainNet/TestNet
  
  `client` - Neo wallet address to be used for sending commands to host
  
  `asset` - Asset hash (GAS by default)
  
  `nodeExpiry` - Fetch a new node after this number of probes with respect to average block time
  
  `showAnomalies` - Display errors and warnings or not
  
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
     
     `node neo-remote-commander`
     
     
    Options:
 
     -d, --delay [optional] => manually specify number of seconds between blockchain probes | default: 5
     
     -v --verbosity [optional] =>one of different verbosity levels: GAS, CMD, OUTPUT, ALL or QUIET | default: ALL

     -h | --help => view all command line args
     
     -v | --version => view version


### Remotely executing commands
From the wallet specified in *./config/app.json*, send an amount of GAS to the same wallet address.

The amount of GAS you send should correspond to a pre-defined command. Example commands can be found in *./config/commands*

You can use an explorer to monitor the host wallet, see when the GAS shows up and see the relativity between command execution time in the terminal/console, and the blockchain probe delay setting.

### Managing spawned processes

The PID of every command executed by the host is always logged in *CMD* and *ALL* verbosity levels.

Because command execution is asynchronous, spawned process outputs get logged to the console with their respective PIDs for reference.

To stop/control a spawned process, you can track the PID in another console instance.

On Linux, you could use `kill <PID> ` to kill a process. And if your command spawned more processes, you can use `ps --ppid <PID>` to see the sub-processes. And then you can kill each individual sub-process, or track further sub-processes.


## Components

### Host dependencies

Node.js and the following Node packages are required in the host:

- [request-promise](https://www.npmjs.com/package/request-promise)
- [date-and-time](https://www.npmjs.com/package/date-and-time)
- [chalk](https://www.npmjs.com/package/chalk)
- [commander](https://www.npmjs.com/package/commander)
- [@cityofzion/neon-js](https://github.com/CityOfZion/neon-js)


## License

MIT
