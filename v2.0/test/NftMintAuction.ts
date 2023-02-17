import { expect } from "chai";
import { ethers } from "hardhat";

describe("Basic NFT Mint Contract", function () {
  let mintNftContract: any;
  let nftDutchAuctionContract: any;
  let owner: any;
  let wallet: any;
  let deployMintContract: any;
  it("testing the smart contract", async function () {
    const [ownerAddress, otherAccount] = await ethers.getSigners();
    wallet = otherAccount;
    owner = ownerAddress;
    const mintAuctionFactory = await ethers.getContractFactory(
      "NftMintAuction"
    );

    deployMintContract = await mintAuctionFactory.deploy(5);
    mintNftContract = await deployMintContract.deployed();
    console.log("mint contract deployed", await mintNftContract.tokenId());
  });

  it("Test for safe mint functionality", async function () {
    const testData = await mintNftContract.safeMint(owner.address);
    console.log("the test data", testData);
  });

  it("deploy the nft dutch auction contract", async function () {
    const dutchNftAuctionFactory = await ethers.getContractFactory(
      "NftDutchAuction"
    );
    const deployNftAuctionContract = await dutchNftAuctionFactory.deploy(
      deployMintContract.address,
      1,
      100,
      10,
      10
    );
    nftDutchAuctionContract = await deployNftAuctionContract.deployed();
  });

  //approve
  // bid before approve

  it("approval to bid the nft", function () {});
});
