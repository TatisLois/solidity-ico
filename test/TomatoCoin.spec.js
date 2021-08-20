const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber, utils } = ethers;
const { formatEther } = utils;

const deployUtility = async () => {
  const TomatoCoin = await ethers.getContractFactory("TomatoCoin");
  const tomatoCoin = await TomatoCoin.deploy();
  await tomatoCoin.deployed();
  return tomatoCoin;
};

describe("TomatoCoin Test Suite", function () {
  it("TomatoCoin deploys with the initial seed phase amount of 75,000 Tokens", async function () {
    const contract = await deployUtility();
    const totalInitialSupplyInGwei = BigNumber.from("75000000000000000000000");
    const contractTotalInitialSupply = await contract.totalSupply();

    expect(totalInitialSupplyInGwei.eq(contractTotalInitialSupply)).to.be.true;
  });
});
