
// const assert = require('assert');
// const ganache = require('ganache-cli');
// require('./helpers/web3');

// const BigNumber = require('bignumber.js');



// const compile = require('../scripts/compile');


// var accounts;

// var MathTest;

// var compilation;
// var contract;

// var ownerAccount;
// var controllerAccount;
// var memberAccount1;
// var memberAccount2;
// var memberAccount3;



// /*

// == Events ==
// Transfer
// Approval
// Mint
// MintFinished
// MintRestarted
// Burn

// OwnershipTransferred
// ContractTransfer


// TokenPurchase
// Closed
// Finalized
// RefundsEnabled
// Refunded



// */





// beforeEach(async function () {
//   this.timeout(global.timeout || 15000)
//   // Get accounts from test system
//   accounts = await web3.eth.getAccounts();

//   ownerAccount = accounts[0];
//   controllerAccount = accounts[1];
//   memberAccount1 = accounts[2];
//   memberAccount2 = accounts[3];
//   memberAccount3 = accounts[4];



//   compilation = await compile("MathTest.sol");

//   contract = compilation.contracts[":MathTest"]

//   MathTest = await new web3.eth.Contract(JSON.parse(contract.interface)).deploy({
//     data: contract.bytecode,
//     // arguments: []
//   }).send({
//     from: ownerAccount,
//     gas: "1999999"
//   }).catch(console.log);
//   web3.eth
//   return MathTest;
// })

// describe('Precision Math', async function () {
//   this.timeout(global.timeout || 15000)
//   describe('Standard Operations', async function () {
//     let ownershipTransferHappened = false;

//     it("Test Deploys", async () => {
//       assert.ok(MathTest.options.address);
//     });

//     it("Calculate Fractions by Decimal and Percentage", async () => {

//       let twoThirds = await MathTest.methods.fractionAsEtherDecimal(2,3).call();
//       let twoThirdsPercent = await MathTest.methods.fractionAsEtherPercent(2,3).call();

//       // Manually increasing Precision should match
//       assert.equal(twoThirdsPercent, twoThirds + "66");

//       var percent = await MathTest.methods.getPercent(web3.utils.toWei("14","ether"), twoThirdsPercent).call();

//       assert.equal(percent, web3.utils.toWei("9.333333333333333333", "ether"));

//       var fraction = await MathTest.methods.getMultiple(web3.utils.toWei("14","ether"), twoThirds).call();
      
//       // Test with lost precision
//       assert.equal(fraction, web3.utils.toWei("9.333333333333333324", "ether"));

//     })

//   });
// });
