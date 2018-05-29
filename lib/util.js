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
    
    getConfig: function(index) {
        try {
            return config[index];
        }
        catch(err) {
            console.error(chalk.white.bgRed('Util.getConfig() => ' + err));
        }
    },

    readFilenames: function(dir) {
        return fs.readdirSync(path.resolve(__dirname, dir), function(err, filenames) {
            if(err)
                console.error(chalk.white.bgRed('Util.readFilenames() => ' + err));
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
                        console.error(chalk.white.bgRed('Util.getCommands() => ' + err));

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
            console.error(chalk.white.bgRed('Util.getCommands() => ' + err));
        }
    },

    runCommand: async function(cmd, verbose) {
        try {
            var newProcess = child_process.exec(cmd);

            if(verbose)
            {
                console.log(chalk.white.bgGreen(' PID ') + chalk.white.bgBlue(' ' + newProcess.pid + ' '));
            }

            newProcess.stdout.on('data', function(data) {
                if(verbose)
                {
                    console.log(chalk.black.bgWhite(data));
                }
            });
        } 
        catch (err) {
            console.error(chalk.white.bgRed('Util.runCommand() exited with code: ' + err.status + ' => ' + err.message));
        }
    }
}

module.exports = {
    getVerbosity: Util.getVerbosity,
    getConfig: Util.getConfig,
    getCommands: Util.getCommands,
    runCommand: Util.runCommand
};
