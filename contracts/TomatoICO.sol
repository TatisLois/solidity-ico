//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Pause.sol";
import "./TomatoCoin.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TomatoICO is Ownable, Pause {
    // === Smart Contracts ===
    TomatoCoin public tomatoCoin;

    // === Mutable Storage ===
    enum Phases {
        SEED,
        GENERAL,
        OPEN
    }

    Phases current = Phases.SEED;

    // Initiail Seed Phase Contribution limit, this increases per phase
    uint256 public tokenContributionLimit = 15000 ether;
    uint256 public purchaseContributionLimit = 1500 ether;
    uint256 public beforeTokenReleaseBalance;
    mapping(address => bool) public seedPhaseInvestor;
    mapping(address => uint256) public purchaseBalance;

    // === Events ===
    event SeedPhaseInvestorAdded(address investor);
    event SeedPhaseInvestorRemoved(address investor);
    event Purchase(
        address indexed from,
        address indexed to,
        uint256 eth,
        uint256 tokens
    );
    event NextPhase(
        Phases previous,
        Phases next,
        uint256 tokenContributionLimit,
        uint256 purchaseContributionLimit
    );
    event Redeemed(address indexed investor, uint256 tokens);
    event Received(address, uint256);

    // === Contructor ===
    constructor() {
        tomatoCoin = new TomatoCoin();
        beforeTokenReleaseBalance = tomatoCoin.balanceOf(address(this));
    }

    // === Modifiers ===
    modifier isAbleToPurchase(address investor) {
        require(
            msg.value * tomatoCoin.rate() <= beforeTokenReleaseBalance,
            "Not enough tokens in the reserve for your purchase"
        );

        if (currentPhase() == Phases.SEED) {
            require(
                seedPhaseInvestor[investor],
                "You must be a seed phase investor"
            );
            require(
                tomatoCoin.balanceOf(investor) + msg.value <=
                    purchaseContributionLimit,
                "You are surpassing the investor contribution limit"
            );
        }

        if (currentPhase() == Phases.GENERAL) {
            require(
                tomatoCoin.balanceOf(investor) + msg.value <=
                    purchaseContributionLimit,
                "You are surpassing the investor contribution limit"
            );
        }
        _;
    }

    modifier isRedeemable(address investor) {
        require(
            currentPhase() == Phases.OPEN,
            "Tokens are not redeemable until the OPEN phase"
        );
        require(purchaseBalance[msg.sender] > 0, "You do not own any tokens");
        _;
    }

    // === Functions ===
    function nextPhase() public isPaused onlyOwner {
        Phases previous = currentPhase();
        if (currentPhase() == Phases.SEED) {
            current = Phases.GENERAL;
            tokenContributionLimit = 30000 ether;
            purchaseContributionLimit = 1000 ether;
            tomatoCoin.mint(address(this), 15000 ether * tomatoCoin.rate());
            beforeTokenReleaseBalance = tomatoCoin.balanceOf(address(this));
        } else if (currentPhase() == Phases.GENERAL) {
            current = Phases.OPEN;
            tokenContributionLimit = type(uint256).max;
            purchaseContributionLimit = type(uint256).max;
            tomatoCoin.mint(address(this), 70000 ether * tomatoCoin.rate());
            beforeTokenReleaseBalance = tomatoCoin.balanceOf(address(this));
        } else {
            require(false, "This is the last phase of the ICO");
        }

        emit NextPhase(
            previous,
            current,
            tokenContributionLimit,
            purchaseContributionLimit
        );
    }

    function myBalance() public view returns (uint256) {
        return purchaseBalance[msg.sender];
    }

    function beforeTokenReleaseTokenReserves() public view returns (uint256) {
        return beforeTokenReleaseBalance / 10**tomatoCoin.decimals();
    }

    function toTokens(address holder) public view returns (uint256) {
        return tomatoCoin.toTokens(holder);
    }

    function currentPhase() public view returns (Phases) {
        return current;
    }

    function includeSeedInvestor(address investor) public onlyOwner {
        seedPhaseInvestor[investor] = true;
        emit SeedPhaseInvestorAdded(investor);
    }

    function revokeSeedInvestor(address investor) public onlyOwner {
        seedPhaseInvestor[investor] = false;
        emit SeedPhaseInvestorRemoved(investor);
    }

    function purchase(uint256 amount)
        public
        payable
        isPaused
        isAbleToPurchase(msg.sender)
    {
        require(
            amount == msg.value,
            "Please make sure the amount sent is correct"
        );
        // tomatoCoin.transfer(msg.sender, msg.value * tomatoCoin.rate());
        purchaseBalance[msg.sender] =
            (purchaseBalance[msg.sender] + msg.value) *
            tomatoCoin.rate();

        beforeTokenReleaseBalance =
            beforeTokenReleaseBalance -
            (msg.value * tomatoCoin.rate());

        emit Purchase(
            address(this),
            msg.sender,
            amount,
            tomatoCoin.toTokens(msg.sender)
        );
    }

    function redeem() external isPaused isRedeemable(msg.sender) {
        uint256 amount = purchaseBalance[msg.sender];
        purchaseBalance[msg.sender] = 0;
        tomatoCoin.transfer(msg.sender, amount);
        emit Redeemed(msg.sender, amount);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
