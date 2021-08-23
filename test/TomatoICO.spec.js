const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber, utils, constants } = ethers;
const { parseEther } = utils;
const TomatoCoinABI = require("../artifacts/contracts/TomatoCoin.sol/TomatoCoin.json");

const deployUtility = async () => {
  const TomatoICO = await ethers.getContractFactory("TomatoICO");
  const tomatoICO = await TomatoICO.deploy();
  await tomatoICO.deployed();
  return tomatoICO;
};

describe("TomatoICO Test Suite", function () {
  it("Deploys and creates an instance of TomatoCoin", async function () {
    const [user] = await ethers.getSigners();
    const contract = await deployUtility();
    const tomatoCoinAddress = await contract.tomatoCoin();
    const tomatoCoinContract = new ethers.Contract(
      tomatoCoinAddress,
      TomatoCoinABI.abi,
      user
    );

    expect(contract).to.exist;
    expect(tomatoCoinContract).to.exist;
  });

  it("Initializes the contract in the seed phase", async function () {
    const contract = await deployUtility();
    const currentPhase = await contract.currentPhase();
    const seedPhase = 0;

    expect(currentPhase).to.eq(seedPhase);
  });

  it("ICO contract owns supply balance and initializes correct reserves", async function () {
    const contract = await deployUtility();
    const contractAddress = await contract.address;
    const expectedReservesInWei = "75000000000000000000000";
    const reserves = await contract.connect(contractAddress).myBalance();

    expect(reserves.toString()).to.eq(expectedReservesInWei);
  });

  it("Owner is able to add a seed phase investor", async function () {
    const [owner, investor] = await ethers.getSigners();
    const contract = await deployUtility();
    const tx = await contract
      .connect(owner)
      .includeSeedInvestor(investor.address);
    const isInvestor = await contract.seedPhaseInvestor(investor.address);
    expect(isInvestor).to.be.true;

    await expect(tx)
      .to.emit(contract, "SeedPhaseInvestorAdded")
      .withArgs(investor.address);
  });

  it("Owner is able to remove a seed phase investor", async function () {
    const [owner, revokedInvestor] = await ethers.getSigners();
    const contract = await deployUtility();
    await contract.connect(owner).includeSeedInvestor(revokedInvestor.address);
    const isInvestor = await contract.seedPhaseInvestor(
      revokedInvestor.address
    );
    expect(isInvestor).to.be.true;

    const tx = await contract
      .connect(owner)
      .revokeSeedInvestor(revokedInvestor.address);
    const isInvestorRevoked = await contract.seedPhaseInvestor(
      revokedInvestor.address
    );
    expect(isInvestorRevoked).to.be.false;

    await expect(tx)
      .to.emit(contract, "SeedPhaseInvestorRemoved")
      .withArgs(revokedInvestor.address);
  });

  it("Throw when a non owner tries to include or revoke a seed phase investor", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const contract = await deployUtility();

    try {
      await contract.connect(notOwner).includeSeedInvestor(notOwner.address);
      // Force a failing assertion
      expect(true).to.be.false;
    } catch (error) {
      expect(error).to.match(/caller is not the owner/);
    }

    try {
      await contract.connect(owner).includeSeedInvestor(notOwner.address);
      await contract.connect(notOwner).revokeSeedInvestor(notOwner.address);
      // Force a failing assertion
      expect(true).to.be.false;
    } catch (error) {
      expect(error).to.match(/caller is not the owner/);
    }
  });

  it("Investor has to be part of the seed phase list to contribute", async function () {
    const [owner, investor, approvedInvestor] = await ethers.getSigners();
    const contract = await deployUtility();
    const value = parseEther("1");

    try {
      await contract
        .connect(owner)
        .includeSeedInvestor(approvedInvestor.address);
      await contract.connect(approvedInvestor).purchase(value, {
        value,
      });
    } catch (error) {
      // Force a failing assertion
      expect(error).to.be.false;
    }

    try {
      await contract.connect(investor).purchase(value, {
        value,
      });

      // Force a failing assertion
      expect(true).to.be.false;
    } catch (error) {
      expect(error).to.match(/You must be a seed phase investor/);
    }
  });

  it("Investor can't contribute over 1,500 ether during seed phase", async function () {
    const [owner, investor] = await ethers.getSigners();
    const contract = await deployUtility();
    const value = parseEther("1501");

    try {
      await contract.connect(owner).includeSeedInvestor(investor.address);
      await contract.connect(investor).purchase(value, {
        value,
      });

      // Force a failing assertion
      expect(true).to.be.false;
    } catch (error) {
      expect(error).to.match(
        /You are surpassing the investor contribution limit/
      );
    }
  });

  it("Investor can't contribute different values for amount and msg.value", async function () {
    const [owner, investor] = await ethers.getSigners();
    const contract = await deployUtility();
    const value = parseEther("1");
    const otherValue = parseEther("5");

    try {
      await contract.connect(owner).includeSeedInvestor(investor.address);
      await contract.connect(investor).purchase(value, {
        value: otherValue,
      });

      // Force a failing assertion
      expect(true).to.be.false;
    } catch (error) {
      expect(error).to.match(/Please make sure the amount sent is correct/);
    }
  });

  it("Purchase events transfers and updates correctly", async function () {
    const [owner, investor] = await ethers.getSigners();
    const contract = await deployUtility();
    const contractAddress = await contract.address;
    const value = parseEther("1");
    const expectedInvestorBalance = BigNumber.from("5000000000000000000");
    const expectedContractBalance = BigNumber.from("74995000000000000000000");
    const expectedInvestorTokens = BigNumber.from("5");
    const expectedContractTokens = BigNumber.from("74995");
    const expectedContractEther = parseEther("1");

    await contract.connect(owner).includeSeedInvestor(investor.address);
    const tx = await contract.connect(investor).purchase(value, {
      value,
    });

    await expect(tx)
      .to.emit(contract, "Purchase")
      .withArgs(
        contractAddress,
        investor.address,
        value,
        expectedInvestorTokens
      );

    investorBalance = await contract.connect(investor).myBalance();
    contractBalance = await contract.connect(contractAddress).myBalance();

    const investorTokens = await contract
      .connect(investor)
      .toTokens(investor.address);

    const contractTokens = await contract
      .connect(contractAddress)
      .toTokens(contractAddress);
    const contractEther = await ethers.provider.getBalance(contractAddress);

    expect(investorBalance.toString()).eq(expectedInvestorBalance);
    expect(investorTokens.toString()).eq(expectedInvestorTokens);

    expect(contractBalance.toString()).eq(expectedContractBalance);
    expect(contractTokens.toString()).eq(expectedContractTokens);

    expect(contractEther.toString()).to.eq(expectedContractEther.toString());
  });

  it("Seed phase total contribution is capped at 15,000", async function () {
    const [owner, ...signers] = await ethers.getSigners();
    const contract = await deployUtility();
    const value = parseEther("1500");

    for (let i = 0; i < 10; i++) {
      await contract.connect(owner).includeSeedInvestor(signers[i].address);
      await contract.connect(signers[i]).purchase(value, { value });
    }

    const contractAddress = await contract.address;
    const contractEther = await ethers.provider.getBalance(contractAddress);
    contractBalance = await contract.connect(contractAddress).myBalance();

    expect(contractBalance.toString()).to.eq("0");
    expect(contractEther.toString()).to.eq(parseEther("15000"));

    try {
      await contract.connect(owner).purchase(value, { value });

      // Force a failing assertion
      expect(true).to.be.false;
    } catch (error) {
      expect(error).to.match(
        /Not enough tokens in the reserve for your purchase/
      );
    }
  });

  it("General phase contribution is capped at 1,000", async function () {
    const [owner, ...signers] = await ethers.getSigners();
    const contract = await deployUtility();
    const value = parseEther("1500");

    await contract.connect(owner).nextPhase();

    try {
      await contract.connect(owner).purchase(value, { value });

      // Force a failing assertion
      expect(true).to.be.false;
    } catch (error) {
      expect(error).to.match(
        /You are surpassing the investor contribution limit/
      );
    }
  });

  it("Open phase contribution is only capped by supplies", async function () {
    const [owner, ...signers] = await ethers.getSigners();
    const contract = await deployUtility();
    const value = parseEther("100001");

    await contract.connect(owner).nextPhase();
    await contract.connect(owner).nextPhase();

    const y = await contract.connect(contract.address).myBalance();
    console.log("myBalance", y.toString());

    await contract.connect(owner).purchase(value, { value });

    const x = await contract.connect(contract.address).myBalance();
    console.log("myBalance", x.toString());
  });

  it("The ICO can cycle through phases by the owner", async function () {
    const [owner] = await ethers.getSigners();
    const contract = await deployUtility();
    const initialPhase = 0;
    const generalPhase = 1;
    const openPhase = 2;

    expect(await contract.connect(owner).currentPhase()).to.eq(initialPhase);

    const txIntoGeneralPhase = await contract.connect(owner).nextPhase();

    await expect(txIntoGeneralPhase)
      .to.emit(contract, "NextPhase")
      .withArgs(
        initialPhase,
        generalPhase,
        parseEther("30000"),
        parseEther("1000")
      );

    expect(await contract.connect(owner).currentPhase()).to.eq(generalPhase);

    const txIntoOpenPhase = await contract.connect(owner).nextPhase();

    await expect(txIntoOpenPhase)
      .to.emit(contract, "NextPhase")
      .withArgs(
        generalPhase,
        openPhase,
        constants.MaxUint256,
        constants.MaxUint256
      );

    expect(await contract.connect(owner).currentPhase()).to.eq(openPhase);

    try {
      await contract.connect(owner).nextPhase();

      // Force a failing assertion
      expect(true).to.be.false;
    } catch (error) {
      expect(error).to.match(/This is the last phase of the ICO/);
    }
  });

  it("", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const contract = await deployUtility();
  });

  // TODO:
  // [] Test for minting beyond cap in coin contract
  // [] Test for coin functions in coin contract
  // [] pause toggle and emit event
  // [] add pay function

  // it("", async function () {
  //  const [owner, notOwner] = await ethers.getSigners();
  //   const contract = await deployUtility();
  //   expect(currentPhase).to.be.false
  // });

  // it("TODO: Test for exchange rate", async function () {
  //   const [owner, investor] = await ethers.getSigners();
  //   const contract = await deployUtility();
  //   const value = parseEther("1");
  //   await contract.connect(owner).includeSeedInvestor(investor.address);
  //   await contract.connect(investor).tokenTest({
  //     value,
  //   });
  // });
});
