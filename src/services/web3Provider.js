import { Web3 } from 'web3';
import CounterContract from '../contracts/Counter.json';

// Network configuration for Polygon Amoy testnet
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

class Web3Provider {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = null;
    this.isConnected = false;
    this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  }

  // Initialize Web3 with Polygon Amoy RPC
  async initialize() {
    try {
      // Check if MetaMask is installed
      if (typeof window !== 'undefined' && window.ethereum) {
        this.web3 = new Web3(window.ethereum);
      } else {
        // Fallback to RPC provider for read-only operations
        this.web3 = new Web3(POLYGON_AMOY_CONFIG.rpcUrls[0]);
      }

      // Initialize contract instance
      if (this.contractAddress && CounterContract.abi) {
        this.contract = new this.web3.eth.Contract(
          CounterContract.abi,
          this.contractAddress
        );
        
        // Verify contract deployment
        try {
          const code = await this.web3.eth.getCode(this.contractAddress);
          if (code === '0x') {
            console.error('No contract found at address:', this.contractAddress);
            throw new Error('Contract not deployed at the specified address');
          }
          console.log('Contract verified at address:', this.contractAddress);
        } catch (verifyError) {
          console.error('Contract verification failed:', verifyError);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      throw new Error('Failed to initialize Web3 provider');
    }
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  }

  // Connect wallet
  async connectWallet() {
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.account = accounts[0];
      this.isConnected = true;

      // Validate network
      await this.validateNetwork();

      // Listen for account changes
      window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
      window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));

      return this.account;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  // Disconnect wallet
  async disconnectWallet() {
    this.account = null;
    this.isConnected = false;
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', this.handleChainChanged);
    }
  }

  // Get current account
  getCurrentAccount() {
    return this.account;
  }

  // Check if wallet is connected
  getConnectionStatus() {
    return this.isConnected;
  }

  // Validate current network
  async validateNetwork() {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== POLYGON_AMOY_CONFIG.chainId) {
        throw new Error('Wrong network. Please switch to Polygon Amoy testnet.');
      }
      
      return true;
    } catch (error) {
      console.error('Network validation failed:', error);
      throw error;
    }
  }

  // Switch to Polygon Amoy network
  async switchToPolygonAmoy() {
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed');
      }

      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CONFIG.chainId }],
      });

      return true;
    } catch (switchError) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_AMOY_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add network:', addError);
          throw new Error('Failed to add Polygon Amoy network');
        }
      } else {
        console.error('Failed to switch network:', switchError);
        throw new Error('Failed to switch to Polygon Amoy network');
      }
    }
  }

  // Get current network information
  async getCurrentNetwork() {
    try {
      if (!window.ethereum) {
        return null;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return {
        chainId,
        isCorrectNetwork: chainId === POLYGON_AMOY_CONFIG.chainId,
        expectedNetwork: POLYGON_AMOY_CONFIG.chainName,
      };
    } catch (error) {
      console.error('Failed to get current network:', error);
      return null;
    }
  }

  // Contract interaction utilities

  // Read counter value
  async getCounterValue() {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      console.log('Reading counter value from contract:', this.contractAddress);
      const count = await this.contract.methods.getCount().call();
      console.log('Counter value retrieved:', count);
      return parseInt(count);
    } catch (error) {
      console.error('Failed to get counter value:', error);
      
      // Check if contract exists at the address
      try {
        const code = await this.web3.eth.getCode(this.contractAddress);
        if (code === '0x') {
          throw new Error('No contract found at the specified address. Please check the contract deployment.');
        }
      } catch (codeError) {
        console.error('Failed to check contract code:', codeError);
      }
      
      throw new Error('Failed to read counter value from contract');
    }
  }

  // Increment counter (write operation)
  async incrementCounter() {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      if (!this.isConnected || !this.account) {
        throw new Error('Wallet not connected');
      }

      // Validate network before transaction
      await this.validateNetwork();

      console.log('Attempting to increment counter...');
      console.log('Contract address:', this.contractAddress);
      console.log('Account:', this.account);

      // First, try to call the method to ensure it works
      try {
        await this.contract.methods.increment().call({
          from: this.account,
        });
        console.log('Contract call simulation successful');
      } catch (callError) {
        console.error('Contract call simulation failed:', callError);
        throw new Error(`Contract call failed: ${callError.message}`);
      }

      // Estimate gas with better error handling
      let gasEstimate;
      try {
        gasEstimate = await this.contract.methods.increment().estimateGas({
          from: this.account,
        });
        console.log('Gas estimate:', gasEstimate);
      } catch (gasError) {
        console.error('Gas estimation failed:', gasError);
        // Use a default gas limit if estimation fails
        gasEstimate = 100000;
        console.log('Using default gas limit:', gasEstimate);
      }

      // Get current gas price
      let gasPrice;
      try {
        gasPrice = await this.web3.eth.getGasPrice();
        console.log('Current gas price:', gasPrice);
      } catch (gasPriceError) {
        console.error('Failed to get gas price:', gasPriceError);
        // Use a default gas price (20 gwei)
        gasPrice = this.web3.utils.toWei('20', 'gwei');
      }

      // Convert BigInt to number and add 50% buffer
      const gasLimit = Math.floor(Number(gasEstimate) * 1.5);

      // Send transaction with explicit gas settings
      const transactionParams = {
        from: this.account,
        gas: gasLimit,
        gasPrice: gasPrice,
      };

      console.log('Transaction parameters:', transactionParams);

      const transaction = await this.contract.methods.increment().send(transactionParams);

      console.log('Transaction successful:', transaction.transactionHash);
      return transaction;
    } catch (error) {
      console.error('Failed to increment counter:', error);
      
      // Provide more specific error messages
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds to pay for transaction fees. Please add more MATIC to your wallet.');
      } else if (error.message.includes('User denied')) {
        throw new Error('Transaction was rejected by user');
      } else if (error.message.includes('gas')) {
        throw new Error('Transaction failed due to gas issues. Please try again.');
      } else if (error.message.includes('Internal JSON-RPC error')) {
        throw new Error('Network error occurred. Please check your connection and try again.');
      }
      
      throw error;
    }
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash) {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized');
      }

      const receipt = await this.web3.eth.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      console.error('Failed to get transaction receipt:', error);
      throw error;
    }
  }

  // Get account balance
  async getAccountBalance(address = null) {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized');
      }

      const account = address || this.account;
      if (!account) {
        throw new Error('No account specified');
      }

      const balance = await this.web3.eth.getBalance(account);
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Failed to get account balance:', error);
      throw error;
    }
  }

  // Event handlers
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      this.disconnectWallet();
    } else {
      this.account = accounts[0];
    }
  }

  handleChainChanged(chainId) {
    // Reload the page when chain changes to avoid state inconsistencies
    window.location.reload();
  }

  // Utility methods
  
  // Convert Wei to Ether
  weiToEther(wei) {
    return this.web3 ? this.web3.utils.fromWei(wei, 'ether') : '0';
  }

  // Convert Ether to Wei
  etherToWei(ether) {
    return this.web3 ? this.web3.utils.toWei(ether, 'ether') : '0';
  }

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Get Polygonscan URL for transaction
  getTransactionUrl(txHash) {
    return `${POLYGON_AMOY_CONFIG.blockExplorerUrls[0]}tx/${txHash}`;
  }

  // Get Polygonscan URL for address
  getAddressUrl(address) {
    return `${POLYGON_AMOY_CONFIG.blockExplorerUrls[0]}address/${address}`;
  }
}

// Create singleton instance
const web3Provider = new Web3Provider();

export default web3Provider;