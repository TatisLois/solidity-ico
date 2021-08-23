//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Pause is Ownable {
    // === Events ===
    event Paused(bool);

    // === Mutable Storage ===
    bool private paused;

    // === Modifiers ===
    modifier isPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    function pauseToggle() public onlyOwner {
        if (paused) {
            paused = false;
        } else {
            paused = true;
        }

        emit Paused(paused);
    }

    function pauseStatus() public view returns (bool) {
        return paused;
    }
}
