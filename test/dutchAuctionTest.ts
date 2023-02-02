import { expect } from "chai";
import { ethers } from "hardhat";
describe("Basic Dutch Auction Contract", function () {
    let contract:any;
    let owner:any;
    let wallet: any;

    beforeEach("testing the smart contract", async function(){
        const [ownerAddress, otherAccount] = await ethers.getSigners();
        wallet = otherAccount;
        owner = ownerAddress;
        const dutchAuction = await ethers.getContractFactory("BasicDutchAuction");
        const deployContract = await dutchAuction.deploy(100,10,10);
        contract =await deployContract.deployed();
    })

    it("Test for checking auction end scenario", async function(){
        expect(await contract.auctionEnded()).to.be.false;
    })

    it("testing the bid functionality",async  function(){
        await contract.connect(wallet).bid({value : 205});
        expect(await contract.auctionEnded()).to.be.true;
        expect(await contract.winner()).be.eq(wallet.address);
    })

    it("it should not allow an invalid bid", async function(){
        try{
            await contract.bid({value:100});
            expect.fail();
        }
        catch(error:any){
            expect(error.message).to.be.revertedWith("Insufficient funds.");
        }
    })


   


  


    


  
}); 