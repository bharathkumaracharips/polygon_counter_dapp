const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Setting up Web3 Counter App for Polygon Amoy deployment...\n');

  // Check if .env file exists
  const envPath = path.join(__dirname, '../.env');
  const envExamplePath = path.join(__dirname, '../.env.example');

  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file from .env.example');
    } else {
      console.log('❌ .env.example file not found');
      return;
    }
  } else {
    console.log('ℹ️  .env file already exists');
  }

  console.log('\n📋 Next steps:');
  console.log('1. Add Polygon Amoy network to MetaMask:');
  console.log('   - Network Name: Polygon Amoy Testnet');
  console.log('   - RPC URL: https://rpc-amoy.polygon.technology');
  console.log('   - Chain ID: 80002');
  console.log('   - Currency: MATIC');
  console.log('   - Block Explorer: https://amoy.polygonscan.com/');
  
  console.log('\n2. Get test MATIC from faucet:');
  console.log('   - Visit: https://faucet.polygon.technology/');
  console.log('   - Select Amoy network');
  console.log('   - Request test tokens');
  
  console.log('\n3. Export your private key from MetaMask:');
  console.log('   - Go to Account Details → Export Private Key');
  console.log('   - Copy the key (without 0x prefix)');
  console.log('   - Add it to your .env file');
  
  console.log('\n4. Deploy the contract:');
  console.log('   - npm run deploy:amoy');
  
  console.log('\n⚠️  Security reminder:');
  console.log('   - Never commit your .env file');
  console.log('   - Use a separate test account for development');
  console.log('   - Keep your private key secure');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });