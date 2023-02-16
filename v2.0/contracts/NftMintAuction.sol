// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NftMintAuction is ERC721 {
    uint public totalSupply;
    uint public currentSupply;
    uint public tokenId = 0;

    constructor(uint _totalSupply) ERC721("NftMintAuction", "MTC") {
        totalSupply = _totalSupply;
        currentSupply = 0;
    }

    function mint() public payable {
        require(currentSupply < totalSupply, "All nft's are already minted");
        _safeMint(msg.sender, tokenId);
        currentSupply++;
        tokenId++;
    }
}
