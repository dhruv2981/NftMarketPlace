import React, { useState, useEffect, useContext } from "react";
import { errors, ethers } from "ethers";
import Web3Modal from "web3modal";
import {useRouter} from "next/router";
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "./constants";
// import { Web3Storage } from "web3.storage";

// const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
// const { Web3Provider } = require('ethers/providers');
const { utils } = require("ethers");
// var cors = require("cors");
const projectId = '2Xi7UzKrgM2eutHzoq5KUlw9Zmp'
const projectSecretKey = '9fc1288fb9d2c95f27b76ccd5f936458'
// const auth=`Basic ${Buffer.from(`${projectId}:${projectSecretKey}`).toString("base64")}`;
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecretKey).toString("base64");
const subdomain = 'https://dhruv12-nft-marketplace.infura-ipfs.io'

const client=ipfsHttpClient({
    host:"ipfs.infura.io",
    port:5001,
    protocol:"https",
    headers:{
        authorization:auth,
    },
})
// const client = new Web3Storage({
//   token:
//     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGM1NTlmYkU1MjlhQzAxMzdGMjg1NTM5NTk2ZjQzRmVlODA1MzYyNEUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTkwODQxODIzMDUsIm5hbWUiOiJOZnRNYXJrZXRQbGFjZSJ9
//       .Je4WxVRY7p4D_qVCb7qwMUt54i4UBiZySw94fa6m0nI,
// });

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
    console.log(contract)
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
        console.log("helloihj")
        await setCurrentAccount(accounts[0]);
        // setTimeout(function () {
        //   // Something you want delayed.
        // }, 5000)
        await console.log(currentAccount,'b');
        console.log("ss");
        console.log("yo")
        console.log('yo')
        return accounts[0];
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
    console.log("2")
    const added = await client.add({
      content: file,
    });
    console.log("1")
    const url = `${subdomain}/ipfs/${added.path}`;
    console.log(url,'c');
    return url;}
    catch(error){
        console.log("error uplaoding",error)
    }
  };

  //create nft function
  const createNFT = async (name,price,image,description,router) => {
    if (!name || !description || !price || !image)
      return console.log("Data is missing");

    const data = JSON.stringify({ name, description, image });

    try {
      const added = await client.add(data);
    //   const url = `https://infura-ipfs.io/ipfs/${added.path}`;
    const url = `${subdomain}/ipfs/${added.path}`;
        

      await createSale(url, price);
      router.push('/searchPage')
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
        : await contract.resellToken(id, price, {
            value: listingPrice.toString(),
          });
        console.log(transaction);
      await transaction.wait();
      
      
    } catch (error) {
      console.log("error while creating sale",error);
    }
  };

  //fetch nft function
  const fetchNFTs = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://sepolia.infura.io/v3/7d6babab81ca431993f87e88414ff850"
      );
      const contract = fetchContract(provider);
      console.log(contract); 
      const data = await contract.fetchMarketItems();
      const items = await Promise.all(
        data.map(
          async ({ tokenId, seller, owner, price: unformattedPrice }) => {
            const tokenURI = await contract.tokenURI(tokenId);
            const {
              data: { image, name, description },
            } = await axios.get(tokenURI);
            const price=0.1;
            // const price = utils.formatUnits(
            //   unformattedPrice,
            //   "ethers"
            // );
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
      console.log(items);
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
          : await contract.fetchMyNFTs();
      const items = await Promise.all(
        data.map(
          async ({ tokenId, seller, owner, price: unformattedPrice }) => {
            const tokenURI = await contract.tokenURI(tokenId);

            const {
              data: { image, name, description },
            } = await axios.get(tokenURI);
            // console.log(data);
            const price=0.1;
            // const price = utils.formatUnits(
            //   unformattedPrice.toString(),
            //   'ethers'
            // );
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
        console.log("eryfj",error)
    }
  };

  useEffect(()=>{
    fetchMyNFTsOrListedNFTs()
  },[])

  //but nft
  const buyNFT = async (nft) => {
    try {
      const contract = await connectingWithSmartContract();
      const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
      console.log(price)
      console.log("hello")
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price,
      });
      console.log(transaction)
      await transaction.wait();
      router.push("/author")
    } catch (error) {
      console.log(error)
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
        createSale,
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
