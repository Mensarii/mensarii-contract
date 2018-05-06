var MensariiCoin = artifacts.require("MensariiCoin.sol");

module.exports = function (deployer, network, accounts) {

  return deployer.then(async () => {
    if (network === "geth") {
      return MensariiCoin.deployed().then((tokenInstance) => {
        global.MensariiCoin = tokenInstance;
      }).catch(err => {
        console.log("deployed error:", err)
      })
    }
    await deployer.deploy(MensariiCoin)

    var token = await MensariiCoin.deployed();
    global.MensariiToken = token;

    console.log("MensariiToken:", token.address);

    return token;
  });
}
