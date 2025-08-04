require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY 
        ? [process.env.PRIVATE_KEY]
        : {
            mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
            path: "m/44'/60'/0'/0",
            initialIndex: 0,
            count: 20,
          },
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
};
