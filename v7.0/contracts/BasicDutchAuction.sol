// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract BasicDutchAuction {
    uint public reservePrice;
    uint public numBlocksAuctionOpen;
    uint public auctionEndBlock;
    uint public offerPriceDecrement;
    uint public initialPrice;
    address payable owner;
    address payable public seller;
    bool public auctionEnded;
    address payable public winner;
    uint256 public currentPrice;
    uint256 public initialBlock;

    constructor(
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) {
        initialBlock = block.number;
        owner = payable(msg.sender);
        seller = payable(msg.sender);
        reservePrice = _reservePrice;
        offerPriceDecrement = _offerPriceDecrement;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        initialPrice =
            _reservePrice +
            _numBlocksAuctionOpen *
            _offerPriceDecrement;
        currentPrice = initialPrice;
        auctionEnded = false;
        auctionEndBlock = block.number + numBlocksAuctionOpen;
        winner = payable(address(0));
    }

    function bid() public payable {
        // require(block.number <= auctionEndBlock, "auction already ended");
        require(msg.value >= updatePrice(), "Insufficient funds.");
        seller.transfer(msg.value);
        winner = payable(msg.sender);
        auctionEnded = true;
    }

    // function  refund() public payable {
    //     require(!auctionEnded, "Auction is still active");
    //     require(msg.sender != winner, "You're the winner. No need of refund");
    //     payable(msg.sender).transfer(msg.value);
    // }

    function updatePrice() internal returns (uint) {
        if (block.number <= auctionEndBlock && msg.value >= reservePrice) {
            currentPrice =
                currentPrice -
                (block.number - initialBlock) *
                offerPriceDecrement;
        }
        return currentPrice;
    }
    
    function getCurrentPrice() public view returns (uint){
        return currentPrice;
    }

    function getWinner() public view returns (address){
        return winner;
    }



    // function finalize() public {
    //     require(block.number > auctionEndBlock, "Auction has not ended yet");
    //     require(auctionEnded == false, "Auction has already ended");
    //     auctionEnded = true;
    //     updatePrice();
    //     if (winner == address(0)) {
    //         seller.transfer(reservePrice);
    //     }
    // }

    //first iteration
    //currentPrice : 200
    //after iteration : 190
    //191
}
