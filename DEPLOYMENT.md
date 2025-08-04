# Smart Contract Deployment Guide

## Prerequisites

1. **MetaMask Wallet**: Install MetaMask browser extension
2. **Test AMOY**: Get test AMOY tokens from Polygon Amoy faucet
3. **Mnemonic Phrase**: Access your wallet's seed phrase (keep it secure!)

## Setup Mnemonic Phrase

### Option 1: Use Your Existing MetaMask Seed Phrase
1. Open MetaMask
2. Click on the account icon (top right)
3. Go to Settings → Security & Privacy
4. Click "Reveal Secret Recovery Phrase"
5. Enter your MetaMask password
6. Copy the 12-word seed phrase
7. **Important**: This gives access to ALL your MetaMask accounts

### Option 2: Create a New Test Wallet (Recommended for Development)
1. Create a new MetaMask profile or use a different browser
2. Set up a new wallet with a fresh seed phrase
3. Use this dedicated test wallet for development
4. Copy the 12-word seed phrase from the new wallet

## Setup Environment

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your `.env` file:
   ```
   POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
   MNEMONIC=your twelve word mnemonic seed phrase goes here like this example
   POLYGONSCAN_API_KEY=your_api_key_optional
   ```

## Add Polygon Amoy Network to MetaMask

1. Open MetaMask
2. Click on the network dropdown (top center)
3. Click "Add Network" → "Add a network manually"
4. Fill in the details:
   - **Network Name**: Polygon Amoy Testnet
   - **New RPC URL**: https://rpc-amoy.polygon.technology
   - **Chain ID**: 80002
   - **Currency Symbol**: AMOY
   - **Block Explorer URL**: https://amoy.polygonscan.com/

## Get Test AMOY Tokens

1. Visit the [Polygon Amoy Faucet](https://faucet.polygon.technology/)
2. Connect your MetaMask wallet
3. Select "Amoy" network
4. Request test AMOY tokens
5. Wait for the transaction to complete

Alternative faucets if the main one doesn't work:
- [Alchemy Amoy Faucet](https://www.alchemy.com/faucets/polygon-amoy)
- [QuickNode Amoy Faucet](https://faucet.quicknode.com/polygon/amoy)

## Deploy Contract

1. Compile the contract:
   ```bash
   npx hardhat compile
   ```

2. Run tests to verify functionality:
   ```bash
   npx hardhat test
   ```

3. Deploy to Amoy testnet:
   ```bash
   npx hardhat run scripts/deploy.js --network amoy
   ```

4. Save the contract address from the deployment output

## Verify Contract (Optional)

1. Get a Polygonscan API key from [PolygonScan](https://polygonscan.com/apis)
2. Add it to your `.env` file
3. Verify the contract:
   ```bash
   npx hardhat verify --network amoy YOUR_CONTRACT_ADDRESS
   ```

## Update Frontend Configuration

After successful deployment, update your frontend environment variables:

```bash
# Add to your .env.local file
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_CHAIN_ID=80002
```

## Contract Details

- **Network**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **Contract**: Counter.sol
- **Functions**:
  - `increment()`: Increments the counter by 1
  - `getCount()`: Returns the current counter value
  - `count`: Public variable to read counter value
- **Events**:
  - `CounterIncremented(uint256 newCount, address incrementedBy)`

## Troubleshooting

### Common Issues

1. **Insufficient funds**: Make sure you have test AMOY tokens in your wallet
2. **Wrong network**: Ensure MetaMask is connected to Amoy testnet
3. **Mnemonic issues**: Make sure mnemonic phrase is correct (12 or 24 words)
4. **RPC issues**: Try alternative RPC URLs if deployment fails

### Alternative RPC URLs

If the default RPC doesn't work, try these alternatives:
- `https://polygon-amoy.drpc.org`
- `https://rpc.ankr.com/polygon_amoy`

## Security Notes

- Never commit your `.env` file to version control
- Keep your private key secure and never share it
- Use a separate wallet for testnet development
- The contract is deployed on testnet - no real value is at risk