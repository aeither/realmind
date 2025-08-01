// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Counter {
    uint256 public number;

    constructor() {
        number = 0;
    }

    function increment() public {
        number++;
    }

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }
}