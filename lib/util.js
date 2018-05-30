'use strict';

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const config = require('../config/app.json');

var Util = {
    getVerbosity: function(option) {
        switch(option) {
            case 'OFF':
                return [0, 0, 0];
                break;
            case 'ALL':
                return [1, 1, 1];
                break;
            case 'GAS':
                return [1, 0, 0];
                break;
            case 'CMD':
                return [0, 1, 0];
                break;
            case 'STDOUT':
                return [0, 0, 1];
                break;
            default:
                return [1, 1, 1];
        }
    },
    
    printWarning: function(text) {
        if(Util.getConfig('showAnomalies'))
            console.warn(chalk.orange.bgBlack(text));
    },
    
    printError: function(text) {
        if(Util.getConfig('showAnomalies'))
            console.error(chalk.red.bgBlack(text));
    },
    
    getConfig: function(index) {
        try {
            return config[index];
        }
        catch(err) {
            Util.printError('Util.getConfig() => ' + err);
        }
    },

    readFilenames: function(dir) {
        return fs.readdirSync(path.resolve(__dirname, dir), function(err, filenames) {
            if(err)
                Util.printError('Util.readFilenames() => ' + err);
        });
    },
    
    getCommands: function(index) {
        try {
            var commands = [];
            const commandFiles = Util.readFilenames('../config/commands/');
            
            commandFiles.forEach(function(commandFile) {
                var rawPath = '../config/commands/' + commandFile;
                fs.stat(rawPath, function(err, stats) {
                    if(err)
                        Util.printError('Util.getCommands() => ' + err);

                    if(!stats.isDirectory()) {
                        let c = require('../config/commands/' + commandFile);
                        Object.keys(c).map(key => {
                            commands[key] = c[key]
                        });
                    }
                });
            });
            
            return commands;
        }
        catch(err) {
            Util.printError('Util.getCommands() => ' + err);
        }
    },

    runCommand: async function(cmd, verbose) {
        try {
            var newProcess = child_process.exec(cmd);

            if(verbose)
            {
                console.log(chalk.white.bgGreen(' PID ') + chalk.white.bgBlue(' ' + newProcess.pid + ' \n'));
            }

            newProcess.stdout.on('data', function(data) {
                if(verbose)
                {
                    console.log(chalk.white.bgBlack(' [' + newProcess.pid + '] ') + chalk.black.bgWhite(data));
                }
            });
        } 
        catch (err) {
            Util.printError('Util.runCommand() exited with code: ' + err.status + ' => ' + err.message);
        }
    }
}

module.exports = {
    getVerbosity: Util.getVerbosity,
    printWarning: Util.printWarning,
    printError: Util.printError,
    getConfig: Util.getConfig,
    getCommands: Util.getCommands,
    runCommand: Util.runCommand
};
