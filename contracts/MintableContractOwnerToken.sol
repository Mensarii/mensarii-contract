pragma solidity ^0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';
import './DisableSelfTransfer.sol';
import './OwnerContract.sol';


contract MintableContractOwnerToken is MintableToken, BurnableToken, OwnerContract, DisableSelfTransfer {

  bool burnAllowed = false;

  // Fired when an approved contract calls restartMint
  event MintRestarted(); 
  // Fired when a transfer is initiated from the contract rather than the owning wallet.
  event ContractTransfer(address from, address to, uint value);

  // Fired when burning status changes
  event BurningStateChange(bool canBurn);

  // opposite of canMint used for restarting the mint
  modifier cantMint() {
    require(mintingFinished);
    _;
  }

  // Require Burn to be turned on
  modifier canBurn() {
    require(burnAllowed);
    _;
  }

  // Require that burning is turned off
  modifier cantBurn() {
    require(!burnAllowed);
    _;
  }

  // Enable Burning Only if Burning is Off
  function enableBurning() public onlyContract cantBurn {
    burnAllowed = true;
    BurningStateChange(burnAllowed);
  }

  // Disable Burning Only if Burning is On
  function disableBurning() public onlyContract canBurn {
    burnAllowed = false;
    BurningStateChange(burnAllowed);
  }

  // Override parent burn function to provide canBurn limitation
  function burn(uint256 _value) public canBurn {
    super.burn(_value);
  }


  // Allow the contract to approve the mint restart 
  // (Voting will be essential in these actions)
  function restartMinting() onlyContract cantMint public returns (bool) {
    mintingFinished = false;
    MintRestarted(); // Notify the blockchain that the coin minting was restarted
    return true;
  }

  // Allow owner or contract to finish minting.
  function finishMinting() onlyOwner canMint public returns (bool) {
    return super.finishMinting();
  }

  // Allow the system to create transactions for transfers when appropriate.
  // (e.g. upgrading the token for everyone, voting to recover accounts for lost private keys, 
  //    allowing the system to pay for transactions on someones behalf, allowing transaction automations)
  // (Must be voted for on an approved contract to gain access to this function)
  function contractTransfer(address _from, address _to, uint256 _value) public onlyContract returns (bool) {
    require(_from != address(0));
    require(_to != address(0));
    require(_value > 0);
    require(_value <= balances[_from]);

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    ContractTransfer(_from, _to, _value); // Notify blockchain the following transaction was contract initiated
    Transfer(_from, _to, _value); // Call original transfer event to maintain compatibility with stardard transaction systems
    return true;
  }

}