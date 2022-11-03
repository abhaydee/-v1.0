import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Input,
  Stack,
} from "@chakra-ui/react";
import BasicDutchAuctionContract from "../src/artifacts/contracts/BasicDutchAuction.sol/BasicDutchAuction.json";
function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [chainId, setChainId] = useState("");
  const [chainName, setChainName] = useState("");
  const [contract, setContract] = useState(null);
  const [input, setInput] = useState({});
  const [bidPrice, setBidPrice] = useState("");
  const [contractData, setContractData] = useState({});

  const handleBidPrice = (event)=>{
    setBidPrice(event.target.value);
  }

  const onClickConnect = () => {
    if (!window.ethereum) {
      console.log("please install MetaMask");
      return;
    }
  
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    provider
      .send("eth_requestAccounts", [])
      .then((accounts) => {
        if (accounts.length > 0) setCurrentAccount(accounts[0]);
      })
      .catch((e) => console.log(e));
  };

  const onClickDisconnect = () => {
    console.log("onClickDisConnect");
    setBalance(undefined);
    setCurrentAccount(undefined);
  };

  const handleDeploy = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const dutchAuction = new ethers.ContractFactory(
      BasicDutchAuctionContract.abi,
      BasicDutchAuctionContract.bytecode,
      signer
    );
    console.log("the input object", input);
    const deployedContract = await dutchAuction.deploy(
      input.reservePrice,
      input.blocksOpen,
      input.offerPriceDecrement
    );
    setContract(deployedContract);
  };

  const getContractInfo = async () => {
    const winner = await contract.getWinner();
    const currentPrice = await contract.currentPrice();
    const auctionEnded = await contract.auctionEnded();
    const reservePrice = await contract.reservePrice();
    setContractData({
      winner,
      currentPrice: parseInt(currentPrice, 10),
      reservePrice: parseInt(reservePrice, 10),
      auctionEnded,
    });
  };

  const handleBid = async ()=>{
    console.log(bidPrice)
    const auctionEnded = await contract.auctionEnded()
    if(auctionEnded){
      alert("Auction already concluded")
    }
   else if(bidPrice < contractData.currentPrice){
      alert("Please provide the appropriate bid price")
    }
    else {
      const bidDetails = await contract.bid({value: bidPrice});
      console.log("the bid details", bidDetails);
    }
  }
  const handleInput = (event) => {
    setInput({
      ...input,
      [event.target.name]: event.target.value,
    });
  };

  useEffect(() => {
    if (!currentAccount || !ethers.utils.isAddress(currentAccount)) return;
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    provider.getBalance(currentAccount).then((result) => {
      setBalance(ethers.utils.formatEther(result));
    });
    provider.getNetwork().then((result) => {
      setChainId(result.chainId);
      setChainName(result.name);
    });
  }, [currentAccount]);

  return (
    <div>
      <VStack>
        <Box w="100%" my={4}>
          {currentAccount ? (
            <Button type="button" w="100%" onClick={onClickDisconnect}>
              Account:{currentAccount}
            </Button>
          ) : (
            <Button type="button" w="100%" onClick={onClickConnect}>
              Connect MetaMask
            </Button>
          )}
        </Box>
        {currentAccount ? (
          <Box mb={0} p={4} w="100%" borderWidth="1px" borderRadius="lg">
            <Heading my={4} fontSize="xl">
              Account info
            </Heading>
            <Text>ETH Balance of current account: {balance}</Text>
            <Text>
              Chain Info: ChainId {chainId} name {chainName}
            </Text>
          </Box>
        ) : (
          <></>
        )}
        <Stack spacing={3} margin={3}>
          <Text> Enter the Reserve Price</Text>
          <Input
            placeholder="Reserve Price"
            name="reservePrice"
            size="md"
            onChange={handleInput}
          />
          <Text> Enter the Blocks to be opened for Auction</Text>
          <Input
            placeholder="Number of Blocks"
            size="md"
            name="blocksOpen"
            onChange={handleInput}
          />
          <Text> Enter the offer price decrement</Text>
          <Input
            placeholder="Offer Price Decrement"
            size="md"
            name="offerPriceDecrement"
            onChange={handleInput}
          />
          <Button type="button" w={"50%"} onClick={handleDeploy}>
            {" "}
            Deploy Contract
          </Button>
        </Stack>
        <Stack>
          <Text> Contract Address : {contract?.address}</Text>
        </Stack>
        <Stack spacing={3}>
          <Text>Get Contract Details</Text>
          <Input
            placeholder="Enter the Contract Address"
            type="text"
            name="contractAddress"
            onChange={handleInput}
          ></Input>
          <Button type="button" onClick={getContractInfo}>
            {" "}
            Get Info
          </Button>
        </Stack>

        <Stack>
          <Text> Contract Details</Text>
          <Text> Current Price : {contractData?.currentPrice}</Text>
          <Text> Reserve Price : {contractData?.reservePrice}</Text>
          <Text> Winner : {contractData?.winner}</Text>
          <Text> Auction Ended State : {contractData?.auctionEnded}</Text>
        </Stack>
        <Stack>
          <Input
            placeholder="Enter the Contract Address"
            type="text"
            name="contractAddress"
            onChange={handleInput}
          ></Input>
          <Text> Enter bid price</Text>
          <Input type="text" name="bidPrice" onChange={handleBidPrice}></Input>
          <Button type="button" onClick={handleBid} w={"60%"}>BID</Button>
        </Stack>
      </VStack>
    </div>
  );
}

export default App;
