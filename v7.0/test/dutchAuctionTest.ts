import { expect } from "chai";
import { ethers } from "hardhat";
import assert = require("assert");
describe("Basic Dutch Auction Contract", function () {
  let contract: any;
  let owner: any;
  let wallet: any;

  beforeEach("testing the smart contract", async function () {
    const [ownerAddress, otherAccount] = await ethers.getSigners();
    wallet = otherAccount;
    owner = ownerAddress;
    const dutchAuction = await ethers.getContractFactory("BasicDutchAuction");
    const deployContract = await dutchAuction.deploy(100, 10, 10);
    contract = await deployContract.deployed();
  });

  it("should return initialPrice before any bids", async function () {
    const currentPrice = await contract.getCurrentPrice();
    expect(currentPrice).to.equal(200);
  });

  it("Test for checking auction end scenario", async function () {
    expect(await contract.auctionEnded()).to.be.false;
  });

  it("testing the bid functionality", async function () {
    const currentPrice = await contract.currentPrice();
    const minBidAmount = currentPrice + 1;
    await contract.connect(wallet).bid({ value: minBidAmount });
    it("Test for checking auction end scenario", async function () {
      // Wait for the auction to end
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      expect(await contract.auctionEnded()).to.be.true;
      expect(await contract.winner()).to.be.equal(wallet.address);

    });
  });

  it("should not allow a bid lower than reserve price", async function () {
    try {
      await contract.bid({ value: 90 });
      assert.fail("Expected bid to throw an error");
    } catch (error:any) {
      assert.equal(error.reason, undefined);
    }
  });
  
});
