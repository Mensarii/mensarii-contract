require('./helpers/web3');

const Promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })
  );

const TokenEvents = async (eventName = 'allEvents', options) => {
  var filterResult = await Promisify(cb => {
    var blockNumber;
    if (Number.isInteger(eventName)) {
      blockNumber = eventName;
      eventName = 'allEvents';
    }
    if (Number.isInteger(options)) {
      blockNumber = options;
      options = void 0;
    }
    if (Number.isInteger(blockNumber)) {
      options = options || {};
      options.fromBlock = options.fromBlock || blockNumber;
      options.toBlock = options.toBlock || blockNumber + 1;
    }
    try {
      MensariiCoin.getPastEvents(eventName, options, cb)
    } catch (e) {
      console.log(eventName, options)
      cb(e)
    }
  });
  return filterResult;
}


const assert = require('assert');

const increaseTime = require('./helpers/increaseTime');
const increaseTimeTo = increaseTime.increaseTimeTo;
const duration = increaseTime.duration;

const BigNumber = require('bignumber.js');

const compile = require('../scripts/compile');


var accounts;

var MensariiCoin;

var compilation;
var contract;

var deployedCoin;

var ownerAccount;
var controllerAccount;
var memberAccount1;
var memberAccount2;
var memberAccount3;




/*

== Events ==
Transfer
Approval
Mint
MintFinished
MintRestarted
Burn

OwnershipTransferred
ContractTransfer


TokenPurchase
Closed
Finalized
RefundsEnabled
Refunded



*/

// before(function (done) {
//   this.timeout(global.timeout || 10000);
//   var interval = setInterval(function () {
//     if (global.MensariiCoin && global.MensariiCrowdsale) {
//       clearInterval(interval);
//       done();
//       return;
//     }

//   }, 200);
// })




beforeEach(async function () {
  this.timeout(global.timeout || 15000)
  // Get accounts from test system
  accounts = await web3.eth.getAccounts();

  ownerAccount = accounts[0];
  controllerAccount = accounts[5];
  memberAccount1 = accounts[6];
  memberAccount2 = accounts[7];
  memberAccount3 = accounts[8];


  if (global.network === "geth" || global.network === "development") {
    MensariiCoin = await new web3.eth.Contract((MensariiToken.abi), MensariiToken.address);
  }
  else {
    console.log("Disabled Network:", global.network)
    return

    compilation = await compile("MensariiCoin.sol");

    contract = compilation.contracts[":MensariiCoin"]

    MensariiCoin = await new web3.eth.Contract(JSON.parse(contract.interface)).deploy({
      data: contract.bytecode,
      // arguments: []
    }).send({
      from: ownerAccount,
      gas: "1999999"
    }).catch(console.log);
    return MensariiCoin;
  }
})

describe('Test Mensarii Coin (MII)', async function () {
  this.timeout(global.timeout || 15000)
  describe('Standard Operations', async function () {
    let ownershipTransfer;

    it("Coin Deploys", async () => {
      assert.ok(MensariiCoin.options.address);
    });

    it("Owner can transfer ownership", async () => {
      // var transferEvent = MensariiCoin.events.OwnershipTransferred({}, function (error, result) {
      //   if (error) {
      //     console.log("Error", error);
      //   }
      //   else {
      //     if (result.returnValues.newOwner === memberAccount1) {
      //       ownershipTransferHappened = true;
      //     }
      //   }
      // });
      ownershipTransfer = await MensariiCoin.methods.transferOwnership(memberAccount1).send({ from: ownerAccount });
      let owner = await MensariiCoin.methods.owner().call();
      assert.equal(owner, memberAccount1);
    });
    it("Owner cannot be transferred by others", async () => {
      try {
        let owner = await MensariiCoin.methods.owner().call();
        let result = await MensariiCoin.methods.transferOwnership(memberAccount1).send({ from: ownerAccount });
        let newOwner = await MensariiCoin.methods.owner().call();
        assert(owner !== newOwner);
        assert(newOwner === memberAccount1);


      }
      catch (e) {
        assert(e);

        let result = await MensariiCoin.methods.transferOwnership(ownerAccount).send({ from: memberAccount1 });

      }

    })

    describe('Events', () => {

      // OwnershipTransferred
      it("OwnershipTransferred Event Fired", async () => {
        if (!ownershipTransfer) assert(false);
        var result = await web3.eth.getTransactionReceipt(ownershipTransfer.transactionHash);
        var events = await TokenEvents("OwnershipTransferred", result.blockNumber);
        assert(events.length > 0);
        // var result = await web3.eth.getTransactionReceipt(ownershipTransfer.transactionHash);

      })

    })
  })

  describe("Mint Operations", async function () {

    it("Mensarii Owner can Mint", async () => {
      await MensariiCoin.methods.mint(memberAccount1, web3.utils.toWei("1", "ether")).send({ from: ownerAccount });
      let balance = await MensariiCoin.methods.balanceOf(memberAccount1).call();
      assert.equal(balance, web3.utils.toWei("1", "ether"))
    })

    it("Mensarii Controller can Mint", async () => {
      await MensariiCoin.methods.addController(controllerAccount).send({ from: ownerAccount });
      await MensariiCoin.methods.mint(memberAccount1, web3.utils.toWei("1", "ether")).send({ from: controllerAccount });

      let balance = await MensariiCoin.methods.balanceOf(memberAccount1).call();
      assert.equal(balance, web3.utils.toWei("2", "ether"))
    })

    it("Mensarii Owner can Close Mint", async () => {
      await MensariiCoin.methods.mint(memberAccount1, web3.utils.toWei("1", "ether")).send({ from: ownerAccount });
      await MensariiCoin.methods.finishMinting().send({ from: ownerAccount });
      let mintClosed = await MensariiCoin.methods.mintingFinished().call();
      assert.equal(mintClosed, true);
    })
    it("Mensarii Only Controller can Reopen Mint", async () => {

      let mintClosed = await MensariiCoin.methods.mintingFinished().call();
      assert.equal(mintClosed, true);

      try {
        await MensariiCoin.methods.mint(memberAccount1, web3.utils.toWei("1", "ether")).send({ from: ownerAccount });
        assert(false);
      } catch (e) {
        assert(true);
      }
      try {
        await MensariiCoin.methods.restartMinting().send({ from: ownerAccount });
      } catch (e) {
        assert(true);
      }
      await MensariiCoin.methods.restartMinting().send({ from: controllerAccount });
      mintClosed = await MensariiCoin.methods.mintingFinished().call();
      assert.equal(mintClosed, false);
      await MensariiCoin.methods.mint(memberAccount1, web3.utils.toWei("0.1", "ether")).send({ from: ownerAccount });
      let balance = await MensariiCoin.methods.balanceOf(memberAccount1).call();
      assert.equal(balance, web3.utils.toWei("3.1", "ether"))
    })

    describe('Events', () => {

    })
  })

  describe("Token Transactions", async () => {
    let transfer;
    let approval;


    // beforeEach(async () => {
    //   await MensariiCoin.methods.mint(memberAccount1, web3.utils.toWei("5", "ether")).send({ from: ownerAccount });
    //   await MensariiCoin.methods.mint(memberAccount2, web3.utils.toWei("5", "ether")).send({ from: ownerAccount });
    //   await MensariiCoin.methods.addController(controllerAccount).send({ from: ownerAccount });
    // })
    it("Customer can Transfer tokens", async () => {

      transfer = await MensariiCoin.methods.transfer(memberAccount3, web3.utils.toWei("1", "ether")).send({ from: memberAccount1 });
      let balance = await MensariiCoin.methods.balanceOf(memberAccount1).call();
      let newBalance = await MensariiCoin.methods.balanceOf(memberAccount3).call();
      assert(newBalance === web3.utils.toWei("1", "ether"));
      assert(balance === web3.utils.toWei("2.1", "ether"));

    })

    it("Customer can Approve others", async () => {
      approval = await MensariiCoin.methods.approve(memberAccount3, web3.utils.toWei("1", "ether")).send({ from: memberAccount1 });
      let balance = await MensariiCoin.methods.balanceOf(memberAccount1).call();
      let newBalance = await MensariiCoin.methods.balanceOf(memberAccount3).call();
      assert(newBalance === web3.utils.toWei("1", "ether"));
      assert(balance === web3.utils.toWei("2.1", "ether"));
      await MensariiCoin.methods.transferFrom(memberAccount1, memberAccount3, web3.utils.toWei("1", "ether")).send({ from: memberAccount3 });
      let newNewBalance = await MensariiCoin.methods.balanceOf(memberAccount3).call();
      assert(newNewBalance > newBalance);
      assert(newNewBalance === web3.utils.toWei("2", "ether"));

    })


    describe('Events', () => {

      // Transfer
      it("Transfer Event Fired", async () => {

        if (!transfer) assert(false);
        var result = await web3.eth.getTransactionReceipt(transfer.transactionHash);
        var events = await TokenEvents("Transfer", result.blockNumber);
        assert(events.length > 0);
        // var result = await web3.eth.getTransactionReceipt(ownershipTransfer.transactionHash);

      })

      // Approval
      it("Approval Event Fired", async () => {
        if (!approval) assert(false);
        var result = await web3.eth.getTransactionReceipt(approval.transactionHash);
        var events = await TokenEvents("Approval", result.blockNumber);
        assert(events.length > 0);
        // var result = await web3.eth.getTransactionReceipt(ownershipTransfer.transactionHash);

      })

    })
  })

  describe("Burnable Token Operations", async () => {

    it("Owner can't Enable burn", async () => {
      try {
        await MensariiCoin.methods.enableBurning().send({ from: memberAccount1 });
        assert(false);
      } catch (e) {
        assert(e);
      }
    })

    it("Member can't Burn Tokens While Disabled", async () => {
      let balance = await MensariiCoin.methods.balanceOf(memberAccount1).call();
      assert.equal(balance, web3.utils.toWei("1.1", "ether"))
      try {
        await MensariiCoin.methods.burn(web3.utils.toWei("0.1", "ether")).send({ from: memberAccount1 });
        assert(false);
      } catch (e) {
        assert(e);
      }
    })


    it("Contract can Enable burn", async () => {
      await MensariiCoin.methods.enableBurning().send({ from: controllerAccount });
    })

    it("Owner can't Disable burn", async () => {
      try {
        await MensariiCoin.methods.disableBurning().send({ from: memberAccount1 });
        assert(false);
      } catch (e) {
        assert(e);
      }
    })

    it("Member can burn Tokens when Enabled", async () => {
      await MensariiCoin.methods.burn(web3.utils.toWei(".1", "ether")).send({ from: memberAccount1 });

      let balance = await MensariiCoin.methods.balanceOf(memberAccount1).call();
      assert.equal(balance, web3.utils.toWei("1", "ether"))
    })

    it("Contract can Disable burn", async () => {
      await MensariiCoin.methods.disableBurning().send({ from: controllerAccount });
    })
  });

});

// Listen to event with event object
// var MensariiCoin = contract.at('CONTRACT ADDRESS');
// var transferEvent = MensariiCoin.events.Transfer({}, function(error, result){
//   if (error) {
//     console.log("Error", error);
//   }
//   else {
//     if (result.returnValues.value === web3.utils.toWei("1", "ether")){
//       transferHappened = true;
//     }
//   }
// });


// Listen to event with filter.
// var filter = web3.eth.filter({fromBlock:0, toBlock: 'latest', address: contractAddress, 'topics':['0x' + web3.sha3('DepositMade(hexstring,uint256)')]});
// filter.watch(function(error, result) {
//  if(!error) console.log(result);
// })