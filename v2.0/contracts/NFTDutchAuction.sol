// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NftDutchAuction is ERC721URIStorage {
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

    address public erc721TAddress;
    uint public nftTokenId;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(
        address erc721TokenAddress,
        uint256 _nftTokenId,
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) ERC721("NftDutchAuction", "Nft") {
        erc721TAddress = erc721TokenAddress;
        nftTokenId = _nftTokenId;
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
        require(block.number <= auctionEndBlock, "auction already ended");
        require(msg.value >= updatePrice(), "Insufficient funds.");
        _safeMint(msg.sender, nftTokenId);
        winner = payable(msg.sender);
        auctionEnded = true;
    }

    // function refund() public payable {
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
