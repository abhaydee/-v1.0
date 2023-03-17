// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Erc20auction is ERC20, ERC20Permit,Ownable {
    uint public maxSupply;
    uint public circulatingSupply;
    uint public tokenId = 0;

    constructor(uint _maxSupply) ERC20("Erc20auction", "ERC") ERC20Permit("Erc20auction") {
        maxSupply = _maxSupply;
    }

    function getMaxSupply() public view returns (uint256) {
        return maxSupply;
    }

    function mint(address to, uint256 amount) public {
        circulatingSupply = totalSupply();
        require(
            circulatingSupply + amount <= maxSupply,
            "All tokens are already minted"
        );
        _mint(to, amount);
    }
}
