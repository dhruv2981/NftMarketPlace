/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images:{
    domains:["dhruv12-nft-marketplace.infura-ipfs.io","infura-ipfs.io"]
  }
}

module.exports = nextConfig
