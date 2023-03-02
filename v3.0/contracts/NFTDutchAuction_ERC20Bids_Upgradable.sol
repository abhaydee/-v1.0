// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./NFTDutchAuction_ERC20Bids.sol";

contract NFTDutchAuction_ERC20Bids_Upgradable is Initializable, NFTDutchAuction_ERC20Bids, UUPSUpgradeable {
    
    function initialize(
        address erc20TokenAddress,
        address erc721TokenAddress,
        uint256 _nftTokenId,
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) public initializer {
        NFTDutchAuction_ERC20Bids.initialize(
            erc20TokenAddress,
            erc721TokenAddress,
            _nftTokenId,
            _reservePrice,
            _numBlocksAuctionOpen,
            _offerPriceDecrement
        );
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

}
