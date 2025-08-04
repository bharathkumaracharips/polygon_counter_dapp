const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x722c882201e13795eee472Fdf9BbFD591DA01701";
  
  console.log("Testing deployed contract at:", contractAddress);
  
  // Get the contract instance
  const Counter = await ethers.getContractFactory("Counter");
  const counter = Counter.attach(contractAddress);
  
  // Test reading the current count
  console.log("Reading current count...");
  const currentCount = await counter.getCount();
  console.log("Current count:", currentCount.toString());
  
  // Test incrementing the counter
  console.log("\nIncrementing counter...");
  const tx = await counter.increment();
  console.log("Transaction hash:", tx.hash);
  
  // Wait for transaction to be mined
  await tx.wait();
  console.log("Transaction confirmed!");
  
  // Read the new count
  const newCount = await counter.getCount();
  console.log("New count:", newCount.toString());
  
  console.log("\n✅ Contract is working correctly!");
  console.log("🔗 View on PolygonScan:", `https://amoy.polygonscan.com/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error testing contract:", error);
    process.exit(1);
  });