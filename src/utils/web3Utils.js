// Web3 utility functions and constants

// Network configurations
export const NETWORKS = {
  POLYGON_AMOY: {
    chainId: '0x13882', // 80002 in hex
    chainIdDecimal: 80002,
    chainName: 'Polygon Amoy Testnet',
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
};

// Error messages
export const ERROR_MESSAGES = {
  METAMASK_NOT_INSTALLED: 'MetaMask is not installed. Please install MetaMask to continue.',
  WALLET_NOT_CONNECTED: 'Please connect your wallet first.',
  WRONG_NETWORK: 'Wrong network. Please switch to Polygon Amoy testnet.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  INSUFFICIENT_FUNDS: 'Insufficient funds to complete the transaction.',
  USER_REJECTED: 'Transaction was rejected by user.',
  CONTRACT_NOT_FOUND: 'Smart contract not found. Please check the contract address.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
};

// Transaction status types
export const TRANSACTION_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
};

// Utility functions

/**
 * Check if the error is due to user rejection
 * @param {Error} error - The error object
 * @returns {boolean} - True if user rejected the transaction
 */
export const isUserRejectedError = (error) => {
  return error.code === 4001 || 
         error.message.includes('User denied') ||
         error.message.includes('User rejected');
};

/**
 * Check if the error is due to insufficient funds
 * @param {Error} error - The error object
 * @returns {boolean} - True if insufficient funds
 */
export const isInsufficientFundsError = (error) => {
  return error.message.includes('insufficient funds') ||
         error.message.includes('insufficient balance');
};

/**
 * Get user-friendly error message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
  if (isUserRejectedError(error)) {
    return ERROR_MESSAGES.USER_REJECTED;
  }
  
  if (isInsufficientFundsError(error)) {
    return ERROR_MESSAGES.INSUFFICIENT_FUNDS;
  }
  
  if (error.message.includes('MetaMask')) {
    return ERROR_MESSAGES.METAMASK_NOT_INSTALLED;
  }
  
  if (error.message.includes('network') || error.message.includes('chain')) {
    return ERROR_MESSAGES.WRONG_NETWORK;
  }
  
  if (error.message.includes('contract')) {
    return ERROR_MESSAGES.CONTRACT_NOT_FOUND;
  }
  
  // Return original error message if no specific case matches
  return error.message || ERROR_MESSAGES.TRANSACTION_FAILED;
};

/**
 * Format address for display (show first 6 and last 4 characters)
 * @param {string} address - The full address
 * @returns {string} - Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format balance for display
 * @param {string|number} balance - Balance in ether
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} - Formatted balance
 */
export const formatBalance = (balance, decimals = 4) => {
  if (!balance) return '0';
  const num = parseFloat(balance);
  return num.toFixed(decimals);
};

/**
 * Format transaction hash for display
 * @param {string} txHash - Transaction hash
 * @returns {string} - Formatted transaction hash
 */
export const formatTxHash = (txHash) => {
  if (!txHash) return '';
  return `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
};

/**
 * Get block explorer URL for transaction
 * @param {string} txHash - Transaction hash
 * @param {string} network - Network name (default: POLYGON_AMOY)
 * @returns {string} - Block explorer URL
 */
export const getTransactionUrl = (txHash, network = 'POLYGON_AMOY') => {
  const networkConfig = NETWORKS[network];
  if (!networkConfig || !txHash) return '';
  return `${networkConfig.blockExplorerUrls[0]}tx/${txHash}`;
};

/**
 * Get block explorer URL for address
 * @param {string} address - Wallet address
 * @param {string} network - Network name (default: POLYGON_AMOY)
 * @returns {string} - Block explorer URL
 */
export const getAddressUrl = (address, network = 'POLYGON_AMOY') => {
  const networkConfig = NETWORKS[network];
  if (!networkConfig || !address) return '';
  return `${networkConfig.blockExplorerUrls[0]}address/${address}`;
};

/**
 * Check if current network is correct
 * @param {string} currentChainId - Current chain ID
 * @param {string} expectedNetwork - Expected network name
 * @returns {boolean} - True if on correct network
 */
export const isCorrectNetwork = (currentChainId, expectedNetwork = 'POLYGON_AMOY') => {
  const networkConfig = NETWORKS[expectedNetwork];
  return currentChainId === networkConfig.chainId;
};

/**
 * Convert Wei to Ether string
 * @param {string|number} wei - Amount in Wei
 * @returns {string} - Amount in Ether
 */
export const weiToEther = (wei) => {
  if (!wei) return '0';
  // Simple conversion for display purposes
  // In a real app, you'd use Web3.utils.fromWei
  return (parseFloat(wei) / Math.pow(10, 18)).toString();
};

/**
 * Convert Ether to Wei string
 * @param {string|number} ether - Amount in Ether
 * @returns {string} - Amount in Wei
 */
export const etherToWei = (ether) => {
  if (!ether) return '0';
  // Simple conversion for display purposes
  // In a real app, you'd use Web3.utils.toWei
  return (parseFloat(ether) * Math.pow(10, 18)).toString();
};

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} - True if valid address
 */
export const isValidAddress = (address) => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate transaction hash
 * @param {string} txHash - Transaction hash to validate
 * @returns {boolean} - True if valid transaction hash
 */
export const isValidTxHash = (txHash) => {
  if (!txHash) return false;
  return /^0x[a-fA-F0-9]{64}$/.test(txHash);
};

/**
 * Sleep utility for delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with function result
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }
  
  throw lastError;
};