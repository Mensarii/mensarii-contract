pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract DisableSelfTransfer is StandardToken {
    
  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_to != address(this));
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    require(_to != address(this));
    return super.transferFrom(_from, _to, _value);
  }

}