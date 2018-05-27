pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

import "./MensariiCoin.sol";

contract MensariiCrowdsale is CappedCrowdsale, TimedCrowdsale, RefundableCrowdsale, MintedCrowdsale {

  function MensariiCrowdsale(uint256 _startTime, uint256 _endTime, uint256 _rate, uint256 _goal, uint256 _cap, address _wallet, MintableToken _token) public
    CappedCrowdsale(_cap)
    FinalizableCrowdsale()
    RefundableCrowdsale(_goal)
    TimedCrowdsale(_startTime, _endTime)
    Crowdsale(_rate, _wallet, _token)
  {
    //As goal needs to be met for a successful crowdsale
    //the value needs to less or equal than a cap which is limit for accepted funds
    require(_goal <= _cap);
  }

  function isOpen() view public returns (bool){
    return now >= openingTime && now <= closingTime;
  }

}
