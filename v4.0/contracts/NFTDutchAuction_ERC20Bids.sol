// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface NftDuctionAuctionInterface {
    function safeTransferFrom(address _from, address _to, uint _tokenId) external;
}

interface ERC20Interface { 
    function transferFrom(address _from, address _to,uint256 amount) external returns(bool);
}

contract NFTDutchAuction_ERC20Bids {
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
    address public erc20Address;
    address public erc721TAddress;
    uint public nftTokenId;
    NftDuctionAuctionInterface interfaceRef;
    ERC20Interface erc20InterfaceRef;
    constructor(
        address erc20TokenAddress,
        address erc721TokenAddress,
        uint256 _nftTokenId,
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) {
        erc20Address = erc20TokenAddress;
        erc721TAddress = erc721TokenAddress;
        nftTokenId = _nftTokenId;
        interfaceRef = NftDuctionAuctionInterface(erc721TokenAddress);
        erc20InterfaceRef = ERC20Interface(erc20TokenAddress);
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

    function bid(uint256 amount) public payable {
        require(block.number <= auctionEndBlock, "auction already ended");
        require(amount >= updatePrice(amount), "Insufficient funds.");
        interfaceRef.safeTransferFrom(owner, msg.sender, nftTokenId);
        erc20InterfaceRef.transferFrom(owner, msg.sender, amount);
        // winner = payable(msg.sender);
        auctionEnded = true;
    }

    // function refund() public payable {
    //     require(!auctionEnded, "Auction is still active");
    //     require(msg.sender != winner, "You're the winner. No need of refund");
    //     payable(msg.sender).transfer(msg.value);
    // }

    function updatePrice(uint256 amount) internal returns (uint) {
        if (block.number <= auctionEndBlock && amount >= reservePrice) {
            currentPrice =
                currentPrice -
                (block.number - initialBlock) *
                offerPriceDecrement;
        }
        console.log("the current price", currentPrice);
        return currentPrice;
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
}
