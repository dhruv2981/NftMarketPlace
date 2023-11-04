import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import {useRouter} from "next/router";
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "./constants";
import { Web3Storage,File } from "web3.storage";

// const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
// const projectId="your project id here";
// const projectSecretKey="project secretKey here"
// const auth=`Basic ${Buffer.from(`${projectId}:${projectSecretKey}`).toString("base64")}`;
// const subdomain="your sub domain"

// const client=ipfsHttpClient({
//     host:"infura-ipfs.io",
//     port:5001,
//     protocol:"https",
//     headers:{
//         authorization:auth,
//     },
// })
const client = new Web3Storage({
  token:
   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGM1NTlmYkU1MjlhQzAxMzdGMjg1NTM5NTk2ZjQzRmVlODA1MzYyNEUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTkwODQxODIzMDUsIm5hbWUiOiJOZnRNYXJrZXRQbGFjZSJ9.Je4WxVRY7p4D_qVCb7qwMUt54i4UBiZySw94fa6m0nI'
});
const client2=new Web3Storage({
    token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGM1NTlmYkU1MjlhQzAxMzdGMjg1NTM5NTk2ZjQzRmVlODA1MzYyNEUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTkwOTcwNzMzNTYsIm5hbWUiOiJEYXRhVG9rZW4ifQ.CZA_kO6xQpzzV__Mnpe_NhkmYRNNuo9dmx8t3PyiKyA'
})

// Fetching Smart Contract
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplaceABI,
    signerOrProvider
  );

// Connecting with smart Contract
const connectingWithSmartContract = async () => {
  try {
    const web3Modal = new Web3Modal();
    //if i am importing Web3Modal as web3Model then it is not happening why  Web3Modal class is there in web3modal package
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    //whoever interact with smart contract become the signer
    const contract = fetchContract(signer);
    return contract;
  } catch (error) {
    console.log("Something went wrong while connecting with contract: ", error);
  }
};

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = ({ children }) => {
  const titleData = "Discover, collect, and sell NFTs";
  const [currentAccount, setCurrentAccount] = useState("");
  const router=useRouter();

  //check if wallet is connected
  const checkIfWalletConnected = async () => {
    try {
      if (!window.ethereum) return console.log("Install metamask");
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        console.log(currentAccount);
        console.log("ss");
      } else {
        console.log("No Account found");
      }
    } catch (error) {
      console.log("Something wrong while connecting to wallet",error);
    }
  };

  //connect wallet function
  const connectWallet = async () => {
    try {
      if (!window.ethereum) return console.log("Install metamask");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
      console.log("connecting wallet")
    //   window.location.reload();
    } catch (error) {
      console.log("Error while connecting to wallet");
    }
  };

  //upload to ipfs
  const uploadToIPFS = async (file) => {
    try{
    const content = [new File([file],"1st nft")];
    // const content = new Blob([file], { type: file.type });
    console.log("a",content);
    const rootCid  = await client.put(content);
    console.log("b");
    const info = await client.status(rootCid);
    const cid=info.cid;
    const url=`https://ipfs.io/ipfs/${cid.toString()}`
    console.log(url);
    return url;
    }
    catch(error){
        console.log("error uploading to ipfs",error);
    }


    // const added = await client.add({
    //   content: file,
    // });
    // const url = `${subdomain}/ipfs/${added.path}`;
    
  };

  //create nft function
  const createNFT = async (name,price,image,description,router,fileUrl) => {
    if (!name || !description || !price || !image)
      return console.log("Data is missing");

    const data = JSON.stringify({ name, description, image});
    const jsonDataBuffer = Buffer.from(data);
    const file = new File([jsonDataBuffer], 'data.json', { type: 'application/json' });



    try {
    const cid = await client2.put([file]);
    console.log(cid);
    //   const added = await client.put(data);
      const url = ``;

      await createSale(url, price);
    } catch (error) {
      console.log(error);
    }
  };

  //create sale function
  const createSale = async (url, formInputPrice, isReselling, id) => {
    try {
      const price = ethers.utils.parseUnits(formInputPrice, "ether");
      const contract = await connectingWithSmartContract();

      const listingPrice = await contract.getListingPrice();
      
      const transaction = !isReselling
        ? await contract.createToken(url, price, {
            value: listingPrice.toString(),
          })
        : await contract.reSellToken(url, price, {
            value: listingPrice.toString(),
          });
        console.log(transaction);
      await transaction.wait();
      router.push('/searchPage');
      
    } catch (error) {
      console.log("error while creating sale");
    }
  };

  //fetch nft function
  const fetchNFTs = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = fetchContract(provider);

      const data = await contract.fetchMarketItem();
      const items = await Promise.all(
        data.map(
          async ({ tokenId, seller, owner, price: unformattedPrice }) => {
            const tokenURI = await contract.tokenURI(tokenId);

            const {
              data: { image, name, description },
            } = await axios.get(tokenURI);
            const price = ethers.price.formatUnits(
              unformattedPrice.toString(),
              "ethers"
            );
            return {
              price,
              tokenId: tokenId.toNumber(),
              seller,
              owner,
              image,
              name,
              description,
              tokenURI,
            };
          }
        )
      );

      return items;
    } catch (error) {
      console.log("Error while fetching nfts",error);
    }
  };

  //fetch my nft(that i bought) or listed nfts
  const fetchMyNFTsOrListedNFTs = async (type) => {
    try {
      const contract = await connectingWithSmartContract();

      const data =
        type == "fetchItemsListed"
          ? await contract.fetchItemsListed()
          : await contract.fetchMyNFT();
      const items = await Promise.all(
        data.map(
          async ({ tokenId, seller, owner, price: unformattedPrice }) => {
            const tokenURI = await contract.tokenURI(tokenId);

            const {
              data: { image, name, description },
            } = await axios.get(tokenURI);
            const price = ethers.price.formatUnits(
              unformattedPrice.toString(),
              "ethers"
            );
            return {
              price,
              tokenId: tokenId.toNumber(),
              seller,
              owner,
              image,
              name,
              description,
              tokenURI,
            };
          }
        )
      );
      return items;
    } catch (error) {}
  };

  //but nft
  const buyNFT = async (nft) => {
    try {
      const contract = await connectingWithSmartContract();
      const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price,
      });
      await transaction.wait();
    } catch (error) {
      console.log("error while buying nfts");
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  // const checkContract=async()=>{
  //     const contract=await connectingWithSmartContract();
  //     console.log(contract);
  //     console.log("checking")
  // }

  return (
    <NFTMarketplaceContext.Provider
      value={{
        checkIfWalletConnected,
        connectWallet,
        uploadToIPFS,
        createNFT,
        fetchNFTs,
        connectingWithSmartContract,
        buyNFT,
        fetchMyNFTsOrListedNFTs,
        titleData,
        currentAccount,
      }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
};
