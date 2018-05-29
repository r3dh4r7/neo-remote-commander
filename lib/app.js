'use strict';

const rp = require('request-promise');
const date = require('date-and-time');
const chalk = require('chalk');
const neon = require('@cityofzion/neon-js');
var Util = require('./util');

var App = {
    lastTransaction: null,
    delay: 0,
    commands: [],
    
    getLatency: function()
    {
        //TODO: calculate default latency from average block time
        return App.delay > 1 ? App.delay * 1000 : 1 * 1000
    },

    getLastTransaction: async function()
    {
        try {
            var account = App.getAccountInstance(Util.getConfig('host')['wallet']['privatekey'],
                                                 Util.getConfig('host')['wallet']['passphrase']);
            var txs = await neon.api.neonDB.getTransactionHistory(Util.getConfig('network'), account.address)
            txs.sort(function(a, b) {
                return parseFloat(b.blockHeight) - parseFloat(a.blockHeight);  
            });
            return txs[0];
        }
        catch(err) {
            console.error(chalk.white.bgRed('App.getLastTransaction() => ' + err));
        }
    },

    storeInitialTransaction: async function()
    {
        App.lastTransaction = await App.getLastTransaction();
        
        if(App.lastTransaction)
            return true;
        else
            return false;
    },
    
    fetchCommands: function() {
        App.commands = Util.getCommands();
    },

    storeLastTransaction: function(tx)
    {
        if(tx)
            App.lastTransaction = tx;
    },

    getCurrentTime: function(format) {
        return date.format(new Date(), format);
    },

    getLastStoredTransaction: function()
    {
        return App.lastTransaction;
    },

    getAccountInstance: function(privateKey, passphrase)
    {
        try {
            const account = new neon.wallet.Account(privateKey);
            account.encrypt(passphrase);
            return account;
        }
        catch(err) {
            console.error(chalk.white.bgRed('App.getAccountInstance() => ' + err));
        }
    },

    getBestRPCNode: async function()
    {
        try {
            return await neon.api.neonDB.getRPCEndpoint(Util.getConfig('network'));
        }
        catch(err) {
            console.error(chalk.white.bgRed('App.getBestRPCNode() => ' + err));
        }
    },
    
    getCommand: function(index) {
        return App.commands[index];
    },

    runCommand: function(index, verbosity)
    {
        if(App.getCommand(index))
            Util.runCommand(App.getCommand(index), verbosity);
        else
            console.warn(chalk.yellow.bgBlack('App.runCommand() => No command configured for ' + index));
    },

    refundGas: async function(amount, addr)
    {
        try {
            let intent = neon.api.makeIntent({GAS:amount}, addr);
            const config = {
                net: Util.getConfig('network'),
                address: Util.getConfig('host')['wallet']['address'],
                privateKey: Util.getConfig('host')['wallet']['privatekey'],
                    intents: intent
            };
            
            neon.api.sendAsset(config)
            .catch(err =>  {
                console.error(chalk.white.bgRed('App.refundGas() => ' + err));
            });
        }
        catch(err) {
            console.error(chalk.white.bgRed('App.refundGas() => ' + err));
        }
    },

    main: async function(verbosity)
    {
        try {
            var lastChainTx = await App.getLastTransaction();
            
            if(lastChainTx && App.getLastStoredTransaction().txid != lastChainTx.txid && lastChainTx.change.GAS > 0)
            {
                var incomingGas = Number.parseFloat(lastChainTx.change.GAS).toFixed(8);
                App.storeLastTransaction(lastChainTx);  // store, to avoid repetition
                App.refundGas(incomingGas, Util.getConfig('client')['wallet']['address']);  // refund immediately
                console.log('\n');
                
                if(verbosity[0])
                    console.log(chalk.white.bgGreen(' GAS ') + chalk.white.bgBlue(' ' + incomingGas) + ' ');
                
                if(verbosity[1])
                {
                    console.log(chalk.white.bgGreen(' COMMAND ') + chalk.white.bgBlue(' ' + App.getCommand(incomingGas) + ' '));
                    console.log(chalk.white.bgGreen(' TIME ') + chalk.white.bgBlue(' ' + App.getCurrentTime('ddd. MMMM DD, YYYY - HH:mm:ss ') + ' '));
                    App.runCommand(incomingGas, true);
                }
                else {
                    App.runCommand(incomingGas, false);
                }
                
                console.log('\n');
            }
        }
        catch(err) {
            console.error(chalk.white.bgRed('\nApp.main() => ' + err + '\n'));
        }
    },

    run: function(verbosity)
    {
        App.main(Util.getVerbosity(verbosity));
    },


    init: function(delay, verbosity) {
        App.delay = delay;
        App.fetchCommands();

        App.storeInitialTransaction()
        .then(function(successful) {
            if(successful)
            {
                console.log(chalk.white.bgGreen.bold(
                            ' Host started: ' + App.getCurrentTime('ddd. MMMM DD, YYYY - HH:mm:ss ')));
                console.log(chalk.white.bgBlue.bold(
                            ' Listening for commands on ' + Util.getConfig('network') + '... '));
                App.run(verbosity);
                
                // Loop
                setInterval(() => { App.run(verbosity) }, App.getLatency());
            }
            else {
                console.error(chalk.white.bgRed('App.init() => Startup failed: could not fetch last blockchain state.'));
            }
        });
    }
}

module.exports = {
    init: App.init
};
