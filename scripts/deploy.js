const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Counter contract to Polygon Amoy testnet...");

  // Get the ContractFactory and Signers here.
  const Counter = await ethers.getContractFactory("Counter");
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const counter = await Counter.deploy();
  await counter.waitForDeployment();

  const contractAddress = await counter.getAddress();
  console.log("Counter contract deployed to:", contractAddress);

  // Verify the initial count is 0
  const initialCount = await counter.getCount();
  console.log("Initial counter value:", initialCount.toString());

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: "amoy",
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    initialCount: initialCount.toString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\nSave this contract address for your frontend configuration:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });