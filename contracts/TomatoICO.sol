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
    uint256 tokenContributionLimit = 15000 ether;
    uint256 purchaseContributionLimit = 1500 ether;
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

    // === Contructor ===
    constructor() {
        // TODO: If possible make this a param we pass in to decouple
        tomatoCoin = new TomatoCoin();
    }

    // === Modifiers ===
    modifier isAbleToPurchase(address investor) {
        require(
            msg.value <= tomatoCoin.balanceOf(address(this)),
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

    // === Functions ===

    function nextPhase() public isPaused onlyOwner {
        Phases previous = currentPhase();
        if (currentPhase() == Phases.SEED) {
            current = Phases.GENERAL;
            tokenContributionLimit = 30000 ether;
            purchaseContributionLimit = 1000 ether;
            tomatoCoin.mint(address(this), 15000 ether * tomatoCoin.rate());
        } else if (currentPhase() == Phases.GENERAL) {
            current = Phases.OPEN;
            tokenContributionLimit = type(uint256).max;
            purchaseContributionLimit = type(uint256).max;
            tomatoCoin.mint(address(this), 70000 ether * tomatoCoin.rate());
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
        return tomatoCoin.balanceOf(msg.sender);
    }

    function tokensAsWei(uint256 amount) public view returns (uint256) {
        return tomatoCoin.tokensAsWei(amount);
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

    // function purchase(uint256 amount)
    //     public
    //     payable
    //     isPaused
    //     isAbleToPurchase(msg.sender)
    // {
    //     require(
    //         amount == msg.value,
    //         "Please make sure the amount sent is correct"
    //     );
    //     tomatoCoin.transfer(msg.sender, msg.value * tomatoCoin.rate());

    //     emit Purchase(
    //         address(this),
    //         msg.sender,
    //         amount,
    //         tomatoCoin.toTokens(msg.sender)
    //     );
    // }

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

        purchaseBalance[msg.sender] = purchaseBalance[msg.sender] + msg.value;

        emit Purchase(
            address(this),
            msg.sender,
            amount,
            tomatoCoin.toTokens(msg.sender)
        );
    }

    function redeem() external payable {
        require(currentPhase() == Phases.OPEN, "Tokens are not redeemable yet");
        console.log("my bal is %s", myBalance());
        // require(amount > 0, "You need to sell at least some tokens");
        // uint256 allowance = token.allowance(msg.sender, address(this));
        // require(allowance >= amount, "Check the token allowance");
        // token.transferFrom(msg.sender, address(this), amount);
        // msg.sender.transfer(amount);
        // emit Redeemed(amount);
    }

    function tokenTest() external payable {
        uint256 amount = msg.value;

        /**
            TODO:
            Amount sent is multiplied by 5 (5 token = 1 ether) to get the exchange rate value in wei. Stored in tokensAsWei

            To get the token amount for a display we pass tokensAsWei into toTokens this divide the valuse of tokenAsWei. EX: tokenAsWei / 10**decimals()
         */
        //  https://docs.soliditylang.org/en/latest/080-breaking-changes.html
        uint256 tokAsWei;
        uint256 tokensForUI;
        unchecked {
            tokAsWei = tomatoCoin.tokensAsWei(amount);
            tokensForUI = tomatoCoin.toTokens(msg.sender);
            console.log("Amount Sent               %s", amount);
            console.log("Investor Tokens:          %s", tokensForUI);
            console.log(
                "TotalSupply in tokens:    %s",
                tomatoCoin.toTokens(address(this))
            );
            console.log(
                "TotalSupply in WEI:       %s",
                tomatoCoin.totalSupply()
            );
            console.log(
                "Total Token BalanceOf:    %s",
                tomatoCoin.balanceOf(address(this))
            );
            console.log("Tokens to WEI             %s", tokensForUI);
            console.log(
                "Token Balance Left:       %s",
                tomatoCoin.balanceOf(address(this)) - tokAsWei
            );
        }
    }
}
