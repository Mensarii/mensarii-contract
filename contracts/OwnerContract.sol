pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract OwnerContract is Ownable {

  event ContractControllerAdded(address contractAddress);
  event ContractControllerRemoved(address contractAddress);


  mapping (address => bool) internal contracts;

  // New modifier to be used in place of OWNER ONLY activity
  // Eventually this will be owned by a controller contract and not a private wallet
  // (Voting needs to be implemented)
  modifier justOwner() {
    require(msg.sender == owner);
    _;
  }
  
  // Allow contracts to have ownership without taking full custody of the token
  // (Until voting is fully implemented)
  modifier onlyOwner() {
    if (msg.sender == address(0) || (msg.sender != owner && !contracts[msg.sender])) {
      revert(); // error for uncontrolled request
    }
    _;
  }

  // Stops owner from gaining access to all functionality
  modifier onlyContract() {
    require(msg.sender != address(0));
    require(contracts[msg.sender]); 
    _;
  }

  // new owner only activity. 
  // (Voting to be implemented for owner replacement)
  function removeController(address controllerToRemove) public justOwner {
    require(contracts[controllerToRemove]);
    contracts[controllerToRemove] = false;
    emit ContractControllerRemoved(controllerToRemove);
  }
  // new owner only activity.
  // (Voting to be implemented for owner replacement)
  function addController(address newController) public justOwner {
    require(contracts[newController] != true);
    contracts[newController] = true;
    emit ContractControllerAdded(newController);
  }

  function isController(address _address) public view returns(bool) {
    return contracts[_address];
  }

}
