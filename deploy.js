const HTWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

let provider = new HTWalletProvider(
  /* pneumonic */'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat',
  /* Infura Link */'https://rinkeby.infura.io/E3MIZIRtCzRQwMKGEmlM'
)

const web3 = new Web3(provider);

const compile = require('./scripts/compile');


let mensariiCoin;

const deploy = async () => {
  const compilation = await compile("MensariiCoin.sol");
  const contract = compilation.contracts[":MensariiCoin"];

  const accounts = await web3.eth.getAccounts();
  console.log("deploying from account ", accounts[0]);

  mensariiCoin = await new web3.eth.Contract(JSON.parse(contract.interface))
    .deploy({
      data: contract.bytecode,
      // arguments: []
    }).send({
      from: accounts[0],
      gas: "4000000"
    });

  console.log("Deployed Mensarii Coin:", mensariiCoin.options.address);
}

deploy();

// let accounts;

// let mensariiCoin;

// let compilation;
// let contract;

// beforeEach(async function () {
//   this.timeout(15000)
//   // Get accounts from test system
//   accounts = await web3.eth.getAccounts();
//   compilation = await compile("MensariiCoin.sol");

//   contract = compilation.contracts[":MensariiCoin"]
//   // Use account to deploy contract
//   mensariiCoin = await new web3.eth.Contract(JSON.parse(contract.interface))
//     .deploy({
//       data: contract.bytecode,
//       // arguments: []
//     }).send({
//       from: accounts[0],
//       gas: "4000000"
//     })
// });