import { useWeb3React } from '@web3-react/core';
import { BigNumber, Contract, ethers, Signer } from 'ethers';
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useState
} from 'react';
import styled from 'styled-components';
import GreeterArtifact from '../artifacts/contracts/Greeter.sol/Greeter.json';
import BasicDutchAuctionArtifact from "../artifacts/contracts/BasicDutchAuction.sol/BasicDutchAuction.json";
import { Provider } from '../utils/provider';
import { SectionDivider } from './SectionDivider';
import { deprecate } from 'util';

const StyledDeployContractButton = styled.button`
  width: 180px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

const StyledGreetingDiv = styled.div`
  /* display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns: 135px 2.7fr 1fr;
  grid-gap: 10px;
  place-self: center;
  align-items: center; */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledLabel = styled.label`
  font-weight: bold;
`;

const StyledInput = styled.input`
  padding: 0.4rem 0.6rem;
  line-height: 2fr;
`;

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  margin-top: 1rem;
`;

const CustomContainer = styled.div`
   margin : 2rem;
   display: flex;
   flex-direction: row;
`

const CustomLabel = styled.div`
  margin-right: 1rem;
`

export function Greeter(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active } = context;

  const [signer, setSigner] = useState<Signer>();
  const [greeterContract, setGreeterContract] = useState<Contract>();
  const [greeterContractAddr, setGreeterContractAddr] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');
  const [greetingInput, setGreetingInput] = useState<string>('');
  const [reservePrice, setReservePrice] = useState<string>("");
  const [blocksOpen, setBlocksOpen] = useState<string>("");
  const [offerPriceDecrement, setOfferPriceDecrement] = useState<string>("");
  const [basicDutchAuctionContract, setBasicDutchAuctionContract] = useState<Contract>();
  const [basicDutchAuctionContractAddr, setBasicDuctionAuctionContractAddr] = useState<string>("");
  const [basicDuctionAuction, setBasicDutchAuction] = useState<string>("");
  const [bidPrice, setBidPrice] = useState<any>();

  const [smartContractData, setSmartContractData] = useState<any>({
    currentPrice :"",
    winner : "",
    reservePrice :"",
    initialBlock :"",
    initialPrice :"",
    offerPriceDecrement :"",
    auctionEnded:"false",
    blocksOpen:""
  })
  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  useEffect((): void => {
    if (!greeterContract) {
      return;
    }

    async function getGreeting(greeterContract: Contract): Promise<void> {
      const _greeting = await greeterContract.greet();

      if (_greeting !== greeting) {
        setGreeting(_greeting);
      }
    }

    getGreeting(greeterContract);
  }, [greeterContract, greeting]);

  const handleReservePrice = (event:any) =>{
    setReservePrice(event.target.value)
  }

  const handleBlocksOpen = (event:any) =>{
    setBlocksOpen(event.target.value)
  }

  const handleOfferPriceDecrement = (event : any) =>{
    setOfferPriceDecrement(event.target.value)
  }

  const handleBid = async (event :any) =>{
    console.log("the event target value", event.target.value)
    setBidPrice(parseInt(event.target.value));
  }

  const submitBid = async () =>{
    console.log("hey", typeof bidPrice)
    try{
      await basicDutchAuctionContract?.bid({value : bidPrice});
      const deployedContract = new ethers.Contract(basicDutchAuctionContractAddr, BasicDutchAuctionArtifact.abi, signer);

      console.log(await deployedContract.getWinner())
      setSmartContractData({
        ...smartContractData,
        winner :await deployedContract.winner()
      })
    }

    catch(error){
      console.log("the error", error)
    }

  

  }
  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the Greeter contract one time, when a signer is defined
    if (basicDutchAuctionContract || !signer) {
      return;
    }

    async function deployBasicDutchContract(signer: Signer): Promise<void> {
      const dutchAuction = new ethers.ContractFactory(
        BasicDutchAuctionArtifact.abi,
        BasicDutchAuctionArtifact.bytecode,
        signer
      )

      try {
        const dutchAuctionContract = await dutchAuction.deploy(reservePrice, blocksOpen, offerPriceDecrement);
        await dutchAuctionContract.deployed();
        
        console.log(dutchAuctionContract)
        console.log(await dutchAuctionContract.initialPrice())
        console.log(await dutchAuctionContract.offerPriceDecrement())
        console.log(await dutchAuctionContract.winner())
        console.log("first fixed value", await dutchAuctionContract.auctionEnded())
        setSmartContractData({
          currentPrice :(await dutchAuctionContract.currentPrice()).toNumber(),
          reservePrice : (await dutchAuctionContract.reservePrice()).toNumber(),
          initialBlock : (await dutchAuctionContract.initialBlock()).toNumber(),
          initialPrice :(await dutchAuctionContract.initialPrice()).toNumber(),
          offerPriceDecrement : (await dutchAuctionContract.offerPriceDecrement()).toNumber(),
          winner : await dutchAuctionContract.winner(),
          auctionEnded : await dutchAuctionContract.auctionEnded().toString(),
          blocksOpen  : (await dutchAuctionContract.numBlocksAuctionOpen()).toNumber()
        })

        setBasicDutchAuctionContract(dutchAuctionContract);
        console.log(" the contract is deployed to ",BigNumber.from(await dutchAuctionContract.currentPrice()))
        // console.log("the current price",BigNumber.from(await dutchAuctionContract.getCurrentPrice()._hex)
        window.alert(`Greeter deployed to: ${dutchAuctionContract.address}`);
        setBasicDuctionAuctionContractAddr(dutchAuctionContract.address);
      }
      catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }


    // deployGreeterContract(signer);
    deployBasicDutchContract(signer)
  }

  function handleGreetingChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setGreetingInput(event.target.value);
  }

  function handleGreetingSubmit(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!greeterContract) {
      window.alert('Undefined greeterContract');
      return;
    }

    if (!greetingInput) {
      window.alert('Greeting cannot be empty');
      return;
    }

    async function submitGreeting(greeterContract: Contract): Promise<void> {
      try {
        const setGreetingTxn = await greeterContract.setGreeting(greetingInput);
        await setGreetingTxn.wait();

        const newGreeting = await greeterContract.greet();
        window.alert(`Success!\n\nGreeting is now: ${newGreeting}`);

        if (newGreeting !== greeting) {
          setGreeting(newGreeting);
        }
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    submitGreeting(greeterContract);
  }


  return (
    <>
      {/* <StyledDeployContractButton
        disabled={!active || greeterContract ? true : false}
        style={{
          cursor: !active || greeterContract ? 'not-allowed' : 'pointer',
          borderColor: !active || greeterContract ? 'unset' : 'blue'
        }}
        onClick={handleDeployContract}
      >
        Deploy Greeter Contract
      </StyledDeployContractButton> */}


      <SectionDivider />
      <StyledGreetingDiv>
        <StyledLabel>Contract addr</StyledLabel>
        <div>
          {basicDutchAuctionContractAddr ? (
            basicDutchAuctionContractAddr
          ) : (
            <em>{`<Contract not yet deployed>`}</em>
          )}
        </div>
        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
        <div></div>
        
        <StyledButton
          disabled={!active || !basicDutchAuctionContract ? true : false}
          style={{
            cursor: !active || !basicDutchAuctionContract ? 'not-allowed' : 'pointer',
            borderColor: !active || !basicDutchAuctionContract ? 'unset' : 'blue'
          }}
          onClick={handleGreetingSubmit}
        >
          Submit
        </StyledButton>

        <CustomContainer>
          <CustomLabel >Enter the Reserve Price</CustomLabel>
          <input type={"text"} onChange={handleReservePrice} placeholder="Reserve Price"/> 
        </CustomContainer>

        <CustomContainer>
          <CustomLabel >Enter the Number of blocks to be opened</CustomLabel>
          <input type={"text"} onChange={handleBlocksOpen} placeholder="Number of open blocks"/> 
        </CustomContainer>

        <CustomContainer>
          <CustomLabel >Enter the Offer Price Decrement</CustomLabel>
          <input type={"text"} onChange={handleOfferPriceDecrement} placeholder="OfferPrice Decrement"/> 
        </CustomContainer>
      


        <StyledDeployContractButton
        disabled={!active || greeterContract ? true : false}
        style={{
          cursor: !active || greeterContract ? 'not-allowed' : 'pointer',
          borderColor: !active || greeterContract ? 'unset' : 'blue'
        }}
        onClick={handleDeployContract}
      >
        Deploy Basic Dutch Auction Contract
      </StyledDeployContractButton>

      <CustomContainer>
        <label> Current Price :</label>
        <label>{smartContractData?.currentPrice}</label>
      </CustomContainer>
      <CustomContainer>
        <label> Winner :</label>
        <label>{smartContractData?.winner}</label>
      </CustomContainer>
      <CustomContainer>
        <label> Number of Blocks open for auction :</label>
        <label>{smartContractData?.blocksOpen}</label>
      </CustomContainer>
      <CustomContainer>
        <label> The Reserve Price :</label>
        <label>{smartContractData?.reservePrice}</label>
      </CustomContainer>

      {/* <CustomContainer>
        <label> Auction ended State : </label>
        <label>{smartContractData?.auctionEnded}</label>
      </CustomContainer> */}

      <CustomContainer>
        <button onClick={submitBid}>Bid</button>
        <input type={"text"} onChange={handleBid} />
      </CustomContainer>
      </StyledGreetingDiv>
    </>
  );
}
