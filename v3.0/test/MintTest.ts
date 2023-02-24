import { expect } from "chai";
import { ethers } from "hardhat";

describe("Dutch Auction Contract", function () {
  let mintNftContract: any;
  let nftDutchAuctionContract: any;
  let owner: any;
  let wallet: any;
  let deployMintContract: any;
  let erc20Contract: any;
  let deployErc20Contract: any;

  let erc20MintAmount = 500;

  it("testing the nft smart contract", async function () {
    const [ownerAddress, otherAccount] = await ethers.getSigners();
    wallet = otherAccount;
    owner = ownerAddress;
    const mintAuctionFactory = await ethers.getContractFactory(
      "NftMintAuction"
    );
    deployMintContract = await mintAuctionFactory.deploy(5);
    mintNftContract = await deployMintContract.deployed();
    console.log("mint contract deployed");
  });

  it("testing the erc20 smart contract", async function () {
    const [ownerAddress, otherAccount] = await ethers.getSigners();
    wallet = otherAccount;
    owner = ownerAddress;
    const erc20Factory = await ethers.getContractFactory("Erc20auction");
    deployErc20Contract = await erc20Factory.deploy(500);
    erc20Contract = await deployErc20Contract.deployed();
    console.log("erc20 contract deployed");
  });

  it("Test for safe mint functionality", async function () {
    await mintNftContract.safeMint(owner.address);
  });

  it("Testing the erc20 mint functionality", async function () {
    await erc20Contract.mint(owner.address, erc20MintAmount);
  });

  it("deploy the nft dutch auction contract", async function () {
    const dutchNftAuctionFactory = await ethers.getContractFactory(
      "NFTDutchAuction_ERC20Bids"
    );
    const deployNftAuctionContract = await dutchNftAuctionFactory.deploy(
      erc20Contract.address,
      deployMintContract.address,
      0,
      200,
      10,
      10
    );
    nftDutchAuctionContract = await deployNftAuctionContract.deployed();
  });

  //approve
  // bid before approve

  it("taking approval from nft contract for bid", async function () {
    await mintNftContract.approve(nftDutchAuctionContract.address, 0);
  });

  it("taking approval from erc20 contract for bid", async function () {
    await erc20Contract
      .connect(wallet)
      .approve(nftDutchAuctionContract.address, 0);
  });

  it("testing the bid functionality", async function () {
    await nftDutchAuctionContract.bid(600);
  });
});
