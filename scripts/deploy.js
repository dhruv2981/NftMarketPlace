const hre = require("hardhat");

async function main() {
  const nftMarketPlace = await hre.ethers.deployContract("NFTMarketplace");

  await nftMarketPlace.waitForDeployment();

  // console.log(
  //   `Lock with ${ethers.formatEther(
  //     lockedAmount
  //   )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
  // );
  console.log(nftMarketPlace);
  console.log(`deployed contract address ${nftMarketPlace.target}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
