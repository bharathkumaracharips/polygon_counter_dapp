const fs = require('fs');
const path = require('path');

async function main() {
  const artifactPath = path.join(__dirname, '../artifacts/contracts/Counter.sol/Counter.json');
  const outputPath = path.join(__dirname, '../src/contracts/Counter.json');
  
  try {
    // Read the compiled artifact
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Extract only the ABI and contract name
    const contractData = {
      contractName: artifact.contractName,
      abi: artifact.abi
    };
    
    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the ABI file
    fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));
    
    console.log('✅ ABI copied successfully to src/contracts/Counter.json');
  } catch (error) {
    console.error('❌ Error copying ABI:', error.message);
    process.exit(1);
  }
}

main();