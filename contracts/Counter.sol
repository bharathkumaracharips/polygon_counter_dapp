// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Counter {
    uint256 public count;
    
    event CounterIncremented(uint256 newCount, address incrementedBy);
    
    constructor() {
        count = 0;
    }
    
    function increment() public {
        count += 1;
        emit CounterIncremented(count, msg.sender);
    }
    
    function getCount() public view returns (uint256) {
        return count;
    }
}