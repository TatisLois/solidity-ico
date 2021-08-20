const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber, utils, Contract } = ethers;
const { formatEther, parseEther } = utils;
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

  it("Owner is able to add a seed phase investor", async function () {
    const [owner, investor] = await ethers.getSigners();
    const contract = await deployUtility();
    const tx = await contract
      .connect(owner)
      .includeSeedInvestor(investor.address);
    const isInvestor = await contract.seedPhaseInvestor(investor.address);
    expect(isInvestor).to.be.true;

    await expect(tx)
      .to.emit(contract, "seedPhaseInvestorAdded")
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
      .to.emit(contract, "seedPhaseInvestorRemoved")
      .withArgs(revokedInvestor.address);
  });

  it("Throw when the non owner tries to include or revoke a seed phase investor", async function () {
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

  it("TODO: Test for exchange rate", async function () {
    const [owner, investor] = await ethers.getSigners();
    const contract = await deployUtility();
    const value = parseEther("15000");
    await contract.connect(owner).includeSeedInvestor(investor.address);
    await contract.connect(investor).purchaseTokens({
      value,
    });
  });

  // TODO:
  // [] Test for minting beyond cap

  // it("", async function () {
  //  const [owner, notOwner] = await ethers.getSigners();
  //   const contract = await deployUtility();
  //   expect(currentPhase).to.be.false
  // });
});
