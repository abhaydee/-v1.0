import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Erc20auction } from "../../v4.0/typechain-types";
import { BigNumber, constants } from "ethers";
async function getPermitSignature(
  signer: any,
  token: Erc20auction,
  spender: string,
  value: any,
  deadline: BigNumber
) {
  const [nonce, name, version, chainId] = await Promise.all([
    token.nonces(signer.address),
    token.name(),
    "1",
    signer.getChainId(),
  ]);

  console.log(token.address);
  return ethers.utils.splitSignature(
    await signer._signTypedData(
      {
        name,
        version,
        chainId,
        verifyingContract: token.address,
      },
      {
        Permit: [
          {
            name: "owner",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      },
      {
        owner: signer.address,
        spender,
        value,
        nonce,
        deadline,
      }
    )
  );
}

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
    deployMintContract = await mintAuctionFactory.deploy(2);
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
    await expect(mintNftContract.safeMint(owner.address));
  });

  it("Test for safe mint functionality duplication", async function () {
    await expect(mintNftContract.safeMint(owner.address));
  });

  it("Test for safe mint functionality failure case ", async function () {
    await expect(mintNftContract.safeMint(owner.address));
  });
  // it("Test for safe mint functionality for the bidder account", async function () {
  //   await expect(mintNftContract.connect(wallet).safeMint(wallet.address));
  // });

  it("Testing the erc20 mint functionality", async function () {
    expect(await erc20Contract.mint(wallet.address, erc20MintAmount));
    console.log("balance check", await erc20Contract.balanceOf(wallet.address));
  });

  it("Testing the erc20 mint functionality after all the tokens are minted ", async function () {
    expect(erc20Contract.mint(wallet.address, 500)).to.be.revertedWith(
      "All tokens are already minted"
    );
  });

  it("deploying the erc20 smart contract for second time", async function () {
    const [ownerAddress, otherAccount] = await ethers.getSigners();
    wallet = otherAccount;
    owner = ownerAddress;
    const erc20Factory = await ethers.getContractFactory("Erc20auction");
    deployErc20Contract = await erc20Factory.deploy(500);
    erc20Contract = await deployErc20Contract.deployed();
    console.log("erc20 contract deployed");
  });

  it("deploy the nft dutch auction contract", async function () {
    const dutchNftAuctionFactory = await ethers.getContractFactory(
      "NFTDutchAuction_ERC20Bids"
    );
    const deployNftAuctionContract = await upgrades.deployProxy(
      dutchNftAuctionFactory,
      [erc20Contract.address, deployMintContract.address, 0, 200, 10, 10],
      {
        initializer:
          "initialize(address, address,uint256, uint256,uint256,uint256)",
        kind: "uups",
      }
    );

    nftDutchAuctionContract = await deployNftAuctionContract.deployed();
  });

  it("Test for checking auction end scenario", async function () {
    expect(await nftDutchAuctionContract.auctionEnded()).to.be.false;
  });

  //approve
  // bid before approve

  it("testing the bid functionality before approval", async function () {
    await expect(nftDutchAuctionContract.bid(500)).to.be.revertedWith(
      "ERC721: caller is not token owner or approved"
    );
  });

  it("ERC20 Permit Reject due to invalid signature. ", async function () {
    const amount = 500;
    const deadline = constants.MaxUint256;
    console.log(erc20Contract.address);
    const { v, r, s } = await getPermitSignature(
      owner,
      erc20Contract,
      nftDutchAuctionContract.address,
      amount,
      deadline
    );
    await expect(
      erc20Contract.permit(
        owner.address,
        nftDutchAuctionContract.address,
        200,
        deadline,
        v,
        r,
        s
      )
    ).to.be.revertedWith("ERC20Permit: invalid signature");
  });

  it("ERC20 Permit function and bid functionality test", async function(){
    const amount = 500;
    const deadline = constants.MaxUint256;
    console.log(erc20Contract.address)
    const {v, r, s} = await getPermitSignature(
        owner,
        erc20Contract,
        nftDutchAuctionContract.address,
        amount,
        deadline
    )
    await erc20Contract.permit(owner.address, nftDutchAuctionContract.address, amount, deadline, v, r, s);
    it("testing the bid functionality", async function () {
      erc20Contract.connect(wallet).approve(nftDutchAuctionContract.address, 500);
      await erc20Contract.mint(wallet.address, erc20MintAmount);
      const balance = await erc20Contract.balanceOf(wallet.address);
      console.log("rechecking balance", balance);
      if (balance >= 500) {
        expect(nftDutchAuctionContract.bid(500)).to.be.revertedWith(
          "auction is closed"
        );
      }
    });
  })

  // it("taking approval from erc20 contract for bid", async function () {
  //   await erc20Contract
  //     .connect(wallet)
  //     .approve(nftDutchAuctionContract.address, 500);
  // });



  // it("testing the max supply for erc20 tokens", async function () {
  //   const totalSupply = await erc20Contract.getMaxSupply();
  //   it("Testing the erc20 mint functionality", async function () {
  //     expect(await erc20Contract.mint(owner.address, 500));
  //   });
  // });

  it("Test for checking auction end scenario", async function () {
    console.log(
      "the auction ended state",
      await nftDutchAuctionContract.auctionEnded()
    );
    expect(await nftDutchAuctionContract.auctionEnded()).to.be.false;
  });
});
