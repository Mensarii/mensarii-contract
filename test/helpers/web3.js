var hdWallet = require('eth-hd-wallet');

function init() {
  global.Web3 = require('web3');
  global.BigNumber = require('bignumber.js');
  global.assert = require('assert');

  if (global.web3 && web3.currentProvider) {
    global.web3 = new Web3(web3.currentProvider)
    global.web3.reset = () => { };
    return;
  }
  console.log("Reset Web3")
  require('events').EventEmitter.prototype._maxListeners = 100;
  global.ganache = require('ganache-cli');


  var provider = ganache.provider({
    // debug:true,
    logger: console,

  });

  // global.web3 = new Web3(provider);
  global.web3 = new Web3('ws://127.0.0.1:9852');
  // web3.reset = init;
  web3.reset = function () { }
}
init();
