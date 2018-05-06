var MensariiCoin = artifacts.require("MensariiCoin.sol");
var MensariiCrowdsale = artifacts.require("MensariiCrowdsale.sol");


module.exports = function (deployer, network, accounts) {

  return deployer.then(async () => {

    if (network === "geth") {
      return MensariiCrowdsale.deployed().then(crowdsaleInstance => {
        global.MensariiCrowdsale = crowdsaleInstance;
      }).catch(err => {
        console.log("deployed error:", err);
      });
    }

    var tokenInstance = await MensariiCoin.deployed();

    var lag = 12;
    if (network === "geth"){
      lag = 120;
    }
    const startTime = (Date.now() / 1000) + lag;
    // const startTime = 1518931829
    const endTime = startTime + (3600 * .5) // half an hour
    const goal = web3.toWei(3, "ether");
    const cap = web3.toWei(10, "ether");
    const rate = 60000;
    const wallet = accounts[0]

    await deployer.deploy(MensariiCrowdsale, startTime, endTime, rate, goal, cap, wallet, tokenInstance.address);

    var crowdsale = await MensariiCrowdsale.deployed()
    global.MensariiCrowdsale = crowdsale;
    await tokenInstance.addController(crowdsale.address)
    var token = await crowdsale.token()

    console.log("MensariiCrowdsale:", crowdsale.address);

    return crowdsale;
  });
};
