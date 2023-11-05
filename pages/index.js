import React,{ useContext,useState,useEffect } from "react";


//INTERNAL IMPORT
import Style from "../styles/index.module.css";
import {
  HeroSection,
  Service,
  BigNFTSilder,
  Subscribe,
  Title,
  Category,
  Filter,
  NFTCard,
  Collection,
  AudioLive,
  FollowerTab,
  Slider,
  Brand,
  Video,
} from "../components/componentsindex";

//importing contract data
import { NFTMarketplaceContext } from "../Context/NFTMarketPlace";



const Home = () => {
  const {checkIfWalletConnected,currentAccount}=useContext(NFTMarketplaceContext);
  useEffect(()=>{
    // connectingWithSmartContract()
    checkIfWalletConnected()


  },[]);
  const { fetchNFTs } = useContext(NFTMarketplaceContext)
  const [nfts, setNfts] = useState([])
  const [nftsCopy, setNftsCopy] = useState([])
  //copy for filter purpose

  useEffect(() => {
    fetchNFTs().then((items) => {
      if (items) {
        setNfts(items.reverse())
        setNftsCopy(items)
        console.log(nfts)
        console.log('nfts')
      } else {
        console.log('error receiving data from nfts okkay')
      }
    })
  }, [])
  // useEffect(() => {
  //   // connectingWithSmartContract()
  //   setCurrentAccount()
  // },[currentAccount])

  return (
    <div className={Style.homePage}>
      <HeroSection />
      <Service />
      <BigNFTSilder />
      <Title
        heading="Audio Collection"
        paragraph="Discover the most outstanding NFTs in all topics of life."
      />
      <AudioLive />
      <FollowerTab />
      <Slider />
      <Collection />
      <Title
        heading="Featured NFTs"
        paragraph="Discover the most outstanding NFTs in all topics of life."
      />
      <Filter />
      <NFTCard NFTData = {nfts}/>
      <Title
        heading="Browse by category"
        paragraph="Explore the NFTs in the most featured categories."
      />
      <Category />
      <Subscribe />
      <Brand />
      <Video />
    </div>
  );
};

export default Home;
