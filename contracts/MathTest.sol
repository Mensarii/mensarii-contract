pragma solidity ^0.4.19;

import './PrecisionMath.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';


contract MathTest {
  using SafeMath for uint256;
  using PrecisionMath for uint256;
  
  function MathTest() public {

  }

  // create a decimal percentage based in ethereum decimal (18 precision)
  function fractionAsEtherDecimal( uint256 numerator, uint256 denominator) public pure returns(uint256) {
    return numerator.divideEtherDecimal(denominator);
  }

  // Create a percent based in ethereum represented as percent (20 precision)
  function fractionAsEtherPercent( uint256 numerator, uint256 denominator) public pure returns (uint256) {
    return numerator.divideEtherPercent(denominator);
  }
  // get percent of incoming value based on decimal represented in ether
  // .2 ether == 20%
  function getMultiple(uint256 incomingValue, uint256 etherDecimal) public pure returns (uint256) {
    return incomingValue.mul(etherDecimal).div(1 ether);
  }
  // get percent of incoming value based on percent represented in ether
  // 20 ether == 20%
  function getPercent(uint256 incomingValue, uint256 etherPercent) public pure returns (uint256) {
    return incomingValue.mul(etherPercent).div(100 ether);
  }
  function getFraction(uint256 incomingValue, uint256 numerator, uint256 denominator) public pure returns (uint256) {
    return incomingValue.getFraction(numerator, denominator);
  }
  
}