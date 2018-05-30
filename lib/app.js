'use strict';

const rp = require('request-promise');
const date = require('date-and-time');
const chalk = require('chalk');
const neon = require('@cityofzion/neon-js');
var Util = require('./util');

var App = {
    node: {url: null, expiry: 0},
    lastTransaction: null,
    delay: 0,
    commands: [],
    
    getLatency: function()
    {
        //TODO: calculate default latency from average network block time
        return App.delay > 1 ? App.delay * 1000 : 1 * 1000
    },

    getLastTransaction: async function()
    {
        try {
            var txs = await neon.api.neonDB.getTransactionHistory(Util.getConfig('network'), Util.getConfig('client'));
            txs.sort(function(a, b) {
                return parseFloat(b.blockHeight) - parseFloat(a.blockHeight);  
            });
            var node = await App.getBestRPCNode();

            var req = {
                  "jsonrpc": "2.0",
                  "method": "getrawtransaction",
                  "params": [txs[0].txid, 1],
                  "id": 1
                };
            var tx = await neon.rpc.queryRPC(node, req);

            if(tx.result.vout)
            {
                txs[0]['asset'] = tx.result.vout[0].asset;
                txs[0]['address'] = tx.result.vout[0].address;
                txs[0]['value'] = tx.result.vout[0].value;
                
                for(var i=0; i<tx.result.vout.length; i++) {
                    if(tx.result.vout[i].address != Util.getConfig('client')
                        || tx.result.vout[i].asset != Util.getConfig('asset'))
                    {
                        txs[0]['asset'] = null;
                        txs[0]['address'] = null;
                        txs[0]['value'] = null;
                        break;
                    }
                }
            }

            return txs[0];
        }
        catch(err) {
            Util.printError('App.getLastTransaction() => ' + err);
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

    getBestRPCNode: async function()
    {
        try {
            if(App.node.expiry == 0)
            {
                App.node.expiry = Util.getConfig('nodeExpiry');
                App.node.url = await neon.api.neonDB.getRPCEndpoint(Util.getConfig('network'));
                return App.node.url;
            }
            else {
                App.node.expiry--;
                return App.node.url;
            }
        }
        catch(err) {
            Util.printError('App.getBestRPCNode() => ' + err);
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
            Util.printWarning('App.runCommand() => No command configured for ' + index);
    },

    main: async function(verbosity)
    {
        try {
            var lastChainTx = await App.getLastTransaction();

            if(lastChainTx && lastChainTx.asset == Util.getConfig('asset')
                && lastChainTx.address == Util.getConfig('client')
                && App.getLastStoredTransaction().txid != lastChainTx.txid)
            {
                var incomingValue = Number.parseFloat(lastChainTx.value).toFixed(8);
                App.storeLastTransaction(lastChainTx);  // store, to avoid repetition
                
                if(verbosity[0])
                    console.log(chalk.white.bgGreen(' INPUT ') + chalk.white.bgBlue(' ' + incomingValue + ' '));
                
                if(verbosity[1])
                {
                    console.log(chalk.white.bgGreen(' COMMAND ') + chalk.white.bgBlue(' ' + App.getCommand(incomingValue) + ' '));
                    console.log(chalk.white.bgGreen(' TIME ') + chalk.white.bgBlue(' ' + App.getCurrentTime('ddd. MMMM DD, YYYY - HH:mm:ss ') + ' '));
                    App.runCommand(incomingValue, true);
                }
                else {
                    App.runCommand(incomingValue, false);
                }
            }
        }
        catch(err) {
            Util.printError('App.main() => ' + err);
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
                            ' Listening for commands on ' + Util.getConfig('network') + '...'));
                console.log('\n');
                App.run(verbosity);
                
                // Loop
                setInterval(() => { App.run(verbosity) }, App.getLatency());
            }
            else {
                console.error(Util.printError('Startup failed: could not fetch last blockchain state.'));
                App.init();
            }
        });
    }
}

module.exports = {
    init: App.init
};
