pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';

library PrecisionMath {
  using SafeMath for uint256;
  using PrecisionMath for uint256;

  function divideEtherDecimal( uint256 numerator, uint256 denominator) internal pure returns (uint256) {
    return numerator.mul(1 ether).div(denominator);
  }

  // Create a percent based in ethereum represented as percent (20 precision)
  function divideEtherPercent( uint256 numerator, uint256 denominator) internal pure returns (uint256) {
    return numerator.mul(100 ether).div(denominator);
  }
  // get percent of incoming value based on decimal represented in ether
  // .2 ether == 20%
  function getEtherMultiple(uint256 incomingValue, uint256 etherDecimal) internal pure returns (uint256) {
    return incomingValue.mul(etherDecimal).div(1 ether);
  }
  // get percent of incoming value based on percent represented in ether
  // 20 ether == 20%
  function getEtherPercent(uint256 incomingValue, uint256 etherPercent) internal pure returns (uint256) {
    return incomingValue.mul(etherPercent).div(100 ether);
  }

  // calculate fraction fraction using 20 points of precision
  function getFraction(uint256 incomingValue, uint256 numerator, uint256 denominator) internal pure returns (uint256) {
    return incomingValue.divideEtherPercent(getEtherPercent(numerator, denominator));
  }
}