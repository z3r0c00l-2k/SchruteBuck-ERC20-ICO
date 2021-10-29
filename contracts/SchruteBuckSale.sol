// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./SchruteBuck.sol";

contract SchruteBuckSale {
    address payable admin;
    SchruteBuck public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold = 0;

    event Sell(address _buyer, uint256 _amount);

    constructor(SchruteBuck _tokenContract, uint256 _tokenPrice) {
        admin = payable(msg.sender);
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _noOfTokens) public payable {
        // Valid purcase amount
        require(msg.value == multiply(_noOfTokens, tokenPrice));
        // Checking available tokens
        require(tokenContract.balanceOf(address(this)) >= _noOfTokens);
        // Transfer amount
        require(tokenContract.transfer(msg.sender, _noOfTokens));

        tokensSold += _noOfTokens;

        emit Sell(msg.sender, _noOfTokens);
    }

    function endSale() public {
        // Checking if its admin
        require(msg.sender == admin);

        // Transfering unsold tokens
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            )
        );

        // Distroy the Sale Contract
        // selfdestruct(payable(admin));
        admin.transfer(address(this).balance);
    }
}
