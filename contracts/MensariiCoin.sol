pragma solidity ^0.4.19;

import './MintableContractOwnerToken.sol';



contract MensariiCoin is MintableContractOwnerToken {
  string public name = "Mensarii Coin";
  string public symbol = "MII";
  uint8 public decimals = 18;

  function MensariiCoin() public {
  }

}
