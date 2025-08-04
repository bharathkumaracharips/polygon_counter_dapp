# Web3Provider Service

The Web3Provider service is a comprehensive solution for integrating Web3 functionality into the Web3 Counter App. It provides wallet connection management, network validation, and smart contract interaction capabilities for the Polygon Amoy testnet.

## Features

- **Web3.js Integration**: Initialize Web3 with Polygon Amoy RPC endpoint
- **Wallet Management**: Connect/disconnect MetaMask wallets with proper error handling
- **Network Validation**: Automatic network detection and switching to Polygon Amoy
- **Smart Contract Interaction**: Read and write operations for the Counter contract
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Utility Functions**: Address formatting, transaction URLs, and balance queries

## Architecture

### Core Components

1. **Web3Provider Class** (`src/services/web3Provider.js`)
   - Singleton service for Web3 operations
   - Manages Web3 instance and contract connections
   - Handles wallet state and network validation

2. **useWeb3 Hook** (`src/hooks/useWeb3.js`)
   - React hook wrapper for Web3Provider
   - Provides reactive state management
   - Handles component lifecycle and event listeners

3. **Utility Functions** (`src/utils/web3Utils.js`)
   - Helper functions for common Web3 operations
   - Error message formatting and validation
   - Network configuration constants

## Usage

### Basic Setup

```javascript
import { useWeb3 } from '../hooks/useWeb3';

function MyComponent() {
  const {
    isConnected,
    account,
    isLoading,
    error,
    connectWallet,
    incrementCounter,
    counterValue
  } = useWeb3();

  // Component logic here
}
```

### Direct Service Usage

```javascript
import web3Provider from '../services/web3Provider';

// Initialize the service
await web3Provider.initialize();

// Connect wallet
const account = await web3Provider.connectWallet();

// Read counter value
const count = await web3Provider.getCounterValue();

// Increment counter
const transaction = await web3Provider.incrementCounter();
```

## API Reference

### Web3Provider Methods

#### Initialization
- `initialize()` - Initialize Web3 with Polygon Amoy RPC
- `isMetaMaskInstalled()` - Check if MetaMask is available

#### Wallet Management
- `connectWallet()` - Connect to MetaMask wallet
- `disconnectWallet()` - Disconnect wallet and cleanup
- `getCurrentAccount()` - Get current connected account
- `getConnectionStatus()` - Check if wallet is connected

#### Network Operations
- `validateNetwork()` - Validate current network is Polygon Amoy
- `switchToPolygonAmoy()` - Switch to Polygon Amoy network
- `getCurrentNetwork()` - Get current network information

#### Contract Interactions
- `getCounterValue()` - Read current counter value from contract
- `incrementCounter()` - Increment counter (requires connected wallet)
- `getTransactionReceipt(txHash)` - Get transaction receipt
- `getAccountBalance(address)` - Get account balance

#### Utility Methods
- `formatAddress(address)` - Format address for display
- `getTransactionUrl(txHash)` - Get Polygonscan transaction URL
- `getAddressUrl(address)` - Get Polygonscan address URL
- `weiToEther(wei)` - Convert Wei to Ether
- `etherToWei(ether)` - Convert Ether to Wei

### useWeb3 Hook Returns

```javascript
const {
  // State
  isConnected,        // boolean - wallet connection status
  account,            // string - connected wallet address
  isLoading,          // boolean - loading state for operations
  error,              // string - current error message
  network,            // object - current network information
  counterValue,       // number - current counter value
  isInitialized,      // boolean - Web3 initialization status
  
  // Actions
  connectWallet,      // function - connect wallet
  disconnectWallet,   // function - disconnect wallet
  switchNetwork,      // function - switch to Polygon Amoy
  incrementCounter,   // function - increment counter
  refreshCounterValue, // function - refresh counter value
  
  // Utilities
  getBalance,         // function - get account balance
  getTransactionReceipt, // function - get transaction receipt
  formatAddress,      // function - format address for display
  getTransactionUrl,  // function - get transaction URL
  getAddressUrl,      // function - get address URL
  
  // Provider info
  isMetaMaskInstalled // boolean - MetaMask availability
} = useWeb3();
```

## Network Configuration

The service is configured for Polygon Amoy testnet:

```javascript
const POLYGON_AMOY_CONFIG = {
  chainId: '0x13882', // 80002 in hex
  chainName: 'Polygon Amoy Testnet',
  rpcUrls: ['https://rpc-amoy.polygon.technology'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
};
```

## Error Handling

The service provides comprehensive error handling for common scenarios:

- **MetaMask not installed**: Clear instructions to install MetaMask
- **User rejection**: User-friendly message when transactions are rejected
- **Wrong network**: Automatic network switching prompts
- **Insufficient funds**: Clear error messages with funding instructions
- **Contract errors**: Specific error messages for contract interaction failures

## Testing

The service includes comprehensive tests:

- **Unit Tests**: Core functionality and error handling
- **Integration Tests**: Service initialization and method calls
- **Hook Tests**: React hook behavior and state management

Run tests with:
```bash
npm test -- src/services src/hooks
```

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Counter contract address
```

## Dependencies

- `web3`: Web3.js library for blockchain interaction
- `react`: React hooks for state management
- Counter contract ABI (imported from `src/contracts/Counter.json`)

## Security Considerations

- All user inputs are validated before blockchain operations
- Network validation prevents operations on wrong networks
- Error messages don't expose sensitive information
- Transaction parameters are validated before submission
- Wallet disconnection properly cleans up event listeners

## Performance Optimizations

- Singleton pattern prevents multiple Web3 instances
- Event listeners are properly managed to prevent memory leaks
- Contract calls are cached where appropriate
- Loading states prevent duplicate operations
- Efficient re-rendering with React hooks

## Browser Compatibility

- Requires modern browser with Web3 support
- MetaMask browser extension required for wallet operations
- Fallback to RPC provider for read-only operations
- Graceful degradation when MetaMask is not available