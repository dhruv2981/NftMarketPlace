const hre = require("hardhat");

async function main() {
  const nftMarketPlace = await hre.ethers.deployContract("NftMarketplace");

  await nftMarketPlace.waitForDeployment();

  // console.log(
  //   `Lock with ${ethers.formatEther(
  //     lockedAmount
  //   )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
  // );
  console.log(`deployed contract address ${nftMarketPlace.address}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
