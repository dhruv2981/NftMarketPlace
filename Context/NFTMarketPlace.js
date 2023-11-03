import React ,{useState,useEffect,useContext} from 'react';
import {ethers} from "ethers";
import Web3Modal from "web3modal";
import Router from "next/router";
import axios from "axios";
import {create as ipfsHttpClient} from "ipfs-http-client";
import {NFTMarketplaceAddress,NFTMarketplaceABI} from "./constants"

const client=ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

// Fetching Smart Contract
const fetchContract=(signerOrProvider)=>new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplaceABI,
    signerOrProvider
);

// Connecting with smart Contract
const connectingWithSmartContract=async()=>{
    try{
        const web3Modal=new Web3Modal();
        //if i am importing Web3Modal as web3Model then it is not happening why  Web3Modal class is there in web3modal package
        const connection=await web3Modal.connect()
        const provider=new ethers.providers.Web3Provider(connection);
        const signer=provider.getSigner();
        //whoever interact with smart contract become the signer
        const contract=fetchContract(signer);
        console.log("connecting")
        return contract;

    }
    catch(error){
        console.log("Something went wrong while connecting with contract: ",error)

    }
}

//upload to ipfs
const uploadToIPFS=async(file)=>{
    const added=await client.add({
        content:file
    })
    const url=`https://ipfs.infura.io/ipfs/${added.path}`
    return url;
}



export const NFTMarketplaceContext=React.createContext();

export const NFTMarketplaceProvider = ({children}) => {
  const titleData = "Discover, collect, and sell NFTs";
  const [currentAccount, setCurrentAccount] = useState("");

  //check if wallet is connected
  const checkIfWalletConnected = async () => {
    try {
      if (!window.ethereum) return console.log("Install metamask");
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length) {
        setCuurentAccount(accounts[0]);
      } else {
        console.log("No Account found");
      }
    } catch (error) {
      console.log("Something wrong while connecting to wallet");
    }
  };

  //connect wallet function
  const connectWallet = async () => {
    try {
      if (!window.ethereum) return console.log("Install metamask");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccount",
      });

        setCuurentAccount(accounts[0]);
        window.location.reload();
      
    } catch (error) {
      console.log("Error while connecting to wallet");
    }
  };

  

  useEffect(()=>{
    checkIfWalletConnected
  },[])


  // const checkContract=async()=>{
  //     const contract=await connectingWithSmartContract();
  //     console.log(contract);
  //     console.log("checking")
  // }

  return (
    <NFTMarketplaceContext.Provider
      value={{ titleData, checkIfWalletConnected }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
}
