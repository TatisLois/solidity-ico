//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./TomatoCoin.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TomatoICO is Ownable {
    // === Smart Contracts ===
    TomatoCoin public tomatoCoin;

    // === Enums and Constants ===
    enum Phases {
        SEED,
        GENERAL,
        OPEN
    }

    Phases current = Phases.SEED;

    // === Mutable Storage ===
    // Initiail Seed Phase Contribution limit, this increases per phase
    uint256 tokenContributionLimit = 15000 ether;
    uint256 purchaseContributionLimit = 1500 ether;
    mapping(address => bool) public seedPhaseInvestor;

    // === Events ===
    event seedPhaseInvestorAdded(address investor);

    event seedPhaseInvestorRemoved(address investor);

    // === Contructor ===
    constructor() {
        tomatoCoin = new TomatoCoin();
    }

    // === Modifiers ===
    modifier isAbleToPurchase(address investor) {
        if (currentPhase() == Phases.SEED) {
            require(
                seedPhaseInvestor[investor],
                "You must be a seed phase investor"
            );
            // require(
            //     balanceOf(investor) + msg.value <= purchaseContributionLimit,
            //     "You are surpassing the investor contribution limit"
            // );
        }

        if (currentPhase() == Phases.GENERAL) {
            require(false, "you GENERAL bum");
        }

        if (currentPhase() == Phases.OPEN) {
            require(false, "you OPEN bum");
        }
        _;
    }

    // === Functions ===

    function currentPhase() public view returns (Phases) {
        return current;
    }

    function includeSeedInvestor(address investor) public onlyOwner {
        seedPhaseInvestor[investor] = true;
        emit seedPhaseInvestorAdded(investor);
    }

    function revokeSeedInvestor(address investor) public onlyOwner {
        seedPhaseInvestor[investor] = false;
        emit seedPhaseInvestorRemoved(investor);
    }

    function balanceOf(address account) public view returns (uint256) {
        return tomatoCoin.balanceOf(account);
    }

    function purchaseTokens() external payable isAbleToPurchase(msg.sender) {
        uint256 amount = msg.value;

        /**
            TODO:
            Amount sent is multiplied by 5 (5 token = 1 ether) to get the exchange rate value in wei. Stored in tokensAsWei

            To get the token amount for a display we pass tokensAsWei into toTokens this divide the valuse of tokenAsWei. EX: tokenAsWei / 10**decimals()
         */
        uint256 tokensAsWei = tomatoCoin.rate(amount);
        uint256 tokensForUI = tomatoCoin.toTokens(tokensAsWei);

        console.log("Amount Sent               %s", amount);
        console.log("Investor Tokens:          %s", tokensForUI);
        console.log(
            "TotalSupply in tokens:    %s",
            tomatoCoin.toTokens(tomatoCoin.totalSupply())
        );
        console.log("TotalSupply in WEI:       %s", tomatoCoin.totalSupply());
        console.log("Total Token BalanceOf:    %s", balanceOf(address(this)));
        console.log("Tokens to WEI             %s", tokensForUI);
        console.log(
            "Token Balance Left:       %s",
            balanceOf(address(this)) - tokensAsWei
        );
    }
}
