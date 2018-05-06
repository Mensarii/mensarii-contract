require('./helpers/web3');

require('truffle-test-utils').init();

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

const CrowdsaleEvents = async (eventName = 'allEvents', options) => {
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
      Crowdsale.getPastEvents(eventName, options, cb)
    } catch (e) {
      console.log(eventName, options)
      cb(e)
    }
  });
  return filterResult;
}

const wait = require('./helpers/wait');
const increaseTime = require('./helpers/increaseTime');
// const increaseTimeTo = increaseTime.increaseTimeTo;
const duration = increaseTime.duration;
// const latestTime = require('./helpers/latestTime');


const compile = require('../scripts/compile');


var accounts;

var compilation;
var coinContract;
var crowdsaleContract;

var Crowdsale;
var Token;

var deployedCoin;
var deployedCrowdsale;

var ownerAccount;
var controllerAccount;
var investorAccount1;
var investorAccount2;
var investorAccount3;



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


var args = {};

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
  // controllerAccount = accounts[1];
  investorAccount1 = accounts[2];
  investorAccount2 = accounts[3];
  investorAccount3 = accounts[4];

  if (global.network === "geth" || global.network === "development") {
    Crowdsale = await new web3.eth.Contract((MensariiCrowdsale.abi), MensariiCrowdsale.address);
    Token = await new web3.eth.Contract((MensariiToken.abi), MensariiToken.address);
  }
  else {
    console.log("Disabled Network:", global.network)
    return
    compilation = await compile("MensariiCrowdsale.sol");
    coinContract = compilation.contracts[":MensariiCoin"];
    crowdsaleContract = compilation.contracts[":MensariiCrowdsale"];
    Token = await new web3.eth.Contract(JSON.parse(coinContract.interface)).deploy({
      data: "0x" + coinContract.bytecode,
      // arguments: []
    }).send({
      from: ownerAccount,
      gas: "1999999"
    }).catch(error => {
      console.log("Coin deploy Error", error)
    });

    // var latestTimeStamp = await latestTime();
    var latestTimeStamp = parseInt(Date.now() / 1000) + 30;

    args.openingTime = latestTimeStamp + 1;// + duration.weeks(1);
    args.closingTime = args.openingTime + duration.weeks(1);
    args.rate = 10;
    args.goal = web3.utils.toWei("0.1", "ether");
    args.cap = web3.utils.toWei("10", "ether");
    args.wallet = ownerAccount;
    // console.log("Token:", Object.keys(Token))
    args.token = Token._address;

    var argArray = [
      args.openingTime,
      args.closingTime,
      args.rate,
      args.goal,
      args.cap,
      args.wallet,
      args.token
    ]
    console.log("Interface", argArray)

    Crowdsale = await new web3.eth.Contract(JSON.parse(crowdsaleContract.interface)).deploy({
      data: crowdsaleContract.bytecode,
      arguments: argArray
    }).send({
      from: ownerAccount,
      gas: "1999999"
    }).catch((err) => {
      console.log("DeployError:", err);
    });


    controllerAccount = Crowdsale.options.address;

    var tokenAddress = await Crowdsale.methods.token().call();

    var isController = await Token.methods.isController(controllerAccount).call();
  }
  return MensariiCrowdsale;
})

describe('Test Mensarii Crowdsale', async function () {
  this.timeout(global.timeout || 30000);


  describe('Standard Operations', async function () {

    // it.only("TestSomething", async function () {

    // });

    let ownershipTransfer;

    it("Crowdsale is Deployed", async () => {
      assert.ok(MensariiCrowdsale.address);
    });


    it("Owner can transfer ownership", async () => {
      
      ownershipTransfer = await Crowdsale.methods.transferOwnership(investorAccount1).send({
        from: ownerAccount,
        gas: "1999999",
      });

      let owner = await Crowdsale.methods.owner().call();
      assert.equal(owner, investorAccount1);


      await Crowdsale.methods.transferOwnership(ownerAccount).send({
        from: investorAccount1,
        gas: "1999999",
      });
      owner = await Crowdsale.methods.owner().call();
      assert.equal(owner, ownerAccount);

    });
    it("Owner cannot be transferred by others", async () => {
      try {
        let owner = await Crowdsale.methods.owner().call();
        let result = await Crowdsale.methods.transferOwnership(investorAccount2).call({ from: ownerAccount });
        let newOwner = await Crowdsale.methods.owner().call();
        assert(owner !== newOwner);
        assert(newOwner !== investorAccount2);

      }
      catch (e) {
        assert(e);
      }

    })

    describe('Events', () => {

      // OwnershipTransferred
      it("OwnershipTransferred Event Fired", async () => {
        if (!ownershipTransfer) assert(false);
        var result = await web3.eth.getTransactionReceipt(ownershipTransfer.transactionHash);
        var events = await CrowdsaleEvents("OwnershipTransferred", result.blockNumber);
        assert(events.length > 0);
        // var result = await web3.eth.getTransactionReceipt(ownershipTransfer.transactionHash);

      })

    })
  })

  describe('Token Sales', async function () {
    let tokenPurchaseHappened = false;

    it("Crowdsale Blocks transactions before opening", async () => {
      try {
        await Crowdsale.methods.buyTokens(investorAccount1).send({
          from: investorAccount1,
          value: 1000,
          gas: "1999999"
        });
      } catch (e) {
        assert(e)
      }

    });

    it("Activated Crowdsale accepts purchase, and awards tokens", async () => {

      var isController = await Token.methods.isController(Crowdsale._address).call();
      var openingTime = await Crowdsale.methods.openingTime().call();
      var closingTime = await Crowdsale.methods.closingTime().call();
      var isOpen = await Crowdsale.methods.isOpen().call();

      if (!isOpen) {
        if (closingTime * 1000 < Date.now()) {
          throw "Unable to test crowdsale after it is closed";
        }
        console.log("Wait Until Open")
        while (openingTime * 1000 > Date.now()) {
          console.log(".");
          await wait(1000)
        }
      }

      var hasClosed = await Crowdsale.methods.hasClosed().call();
      
      var send = await Crowdsale.methods.buyTokens(investorAccount1).send({
        from: investorAccount1,
        gas: "1999999",
        value: web3.utils.toWei("0.1", "ether")
      });
      let balance = await Token.methods.balanceOf(investorAccount1).call();
      let rate = await Crowdsale.methods.rate().call();
      balance = new BigNumber(balance);
      let etherWei = BigNumber(web3.utils.toWei("0.1", "ether")).times(rate);
      while (balance.lt(etherWei)) {
        await wait.seconds(5);
        balance = await Token.methods.balanceOf(investorAccount1).call();
        balance = new BigNumber(balance);
      }
      assert(balance.gte(etherWei));
    });
    
    describe('Events', () => {

    })
  })
});
