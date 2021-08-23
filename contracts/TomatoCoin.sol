//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Pause.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TomatoCoin is ERC20, Ownable, Pause {
    // === Constants ===
    uint256 constant MAX_SUPPLY = 500000000000000000000000;

    // === Immutable Storage ===
    uint256 public rate = 5;

    // === Contructor ===
    constructor() ERC20("Tomato", "TOM") {
        _mint(msg.sender, 75000 * 10**decimals());
    }

    // === Functions ===
    function mint(address to, uint256 amount) public isPaused onlyOwner {
        require(
            (totalSupply() + amount) <= MAX_SUPPLY,
            "Max token supply reached"
        );
        _mint(to, amount);
    }

    function toTokens(address holder) public view returns (uint256) {
        uint256 amount = balanceOf(holder);
        return amount / 10**decimals();
    }

    function _transfer(
        address from,
        address to,
        uint256 value
    ) internal override isPaused {
        super._transfer(from, to, value);
    }
}
