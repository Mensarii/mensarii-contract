var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
  global.network = network;
  return deployer.then(async () => {
    if (network === "geth") {
      global.timeout = 9999999;
      global.network = network;
      return Migrations.deployed().then((migrationInstance) => {
        global.Migrations = migrationInstance;
      }).catch(err => {
        console.log("deployed error:", err)
      })
    }
    return deployer.deploy(Migrations);
    
  })
};
