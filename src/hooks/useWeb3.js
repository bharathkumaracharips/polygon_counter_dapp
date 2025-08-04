import { useState, useEffect, useCallback } from 'react';
import web3Provider from '../services/web3Provider';

export const useWeb3 = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [network, setNetwork] = useState(null);
  const [counterValue, setCounterValue] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Web3 provider
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await web3Provider.initialize();
      setIsInitialized(true);
      
      // Check if already connected by querying MetaMask directly
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // Wallet is connected, update provider state
            web3Provider.account = accounts[0];
            web3Provider.isConnected = true;
            setIsConnected(true);
            setAccount(accounts[0]);
          }
        } catch (err) {
          console.log('No accounts found or user denied access');
        }
      } else if (web3Provider.getConnectionStatus()) {
        // Fallback to provider state
        setIsConnected(true);
        setAccount(web3Provider.getCurrentAccount());
      }
      
      // Get initial counter value
      await refreshCounterValue();
      
    } catch (err) {
      setError(err.message);
      console.error('Web3 initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!web3Provider.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const connectedAccount = await web3Provider.connectWallet();
      setAccount(connectedAccount);
      setIsConnected(true);
      
      // Get network info after connection
      const networkInfo = await web3Provider.getCurrentNetwork();
      setNetwork(networkInfo);
      
      // Refresh counter value
      await refreshCounterValue();
      
    } catch (err) {
      setError(err.message);
      console.error('Wallet connection failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await web3Provider.disconnectWallet();
      setAccount(null);
      setIsConnected(false);
      setNetwork(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Wallet disconnection failed:', err);
    }
  }, []);

  // Switch to Polygon Amoy network
  const switchNetwork = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await web3Provider.switchToPolygonAmoy();
      
      // Update network info
      const networkInfo = await web3Provider.getCurrentNetwork();
      setNetwork(networkInfo);
      
    } catch (err) {
      setError(err.message);
      console.error('Network switch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh counter value
  const refreshCounterValue = useCallback(async () => {
    try {
      const value = await web3Provider.getCounterValue();
      setCounterValue(value);
    } catch (err) {
      console.error('Failed to refresh counter value:', err);
      // Don't set error for counter refresh failures as it's not critical
    }
  }, []);

  // Increment counter
  const incrementCounter = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isConnected) {
        throw new Error('Please connect your wallet first');
      }

      const transaction = await web3Provider.incrementCounter();
      
      // Refresh counter value after successful transaction
      await refreshCounterValue();
      
      return transaction;
      
    } catch (err) {
      setError(err.message);
      console.error('Counter increment failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, refreshCounterValue]);

  // Get account balance
  const getBalance = useCallback(async (address = null) => {
    try {
      return await web3Provider.getAccountBalance(address);
    } catch (err) {
      console.error('Failed to get balance:', err);
      return '0';
    }
  }, []);

  // Get transaction receipt
  const getTransactionReceipt = useCallback(async (txHash) => {
    try {
      return await web3Provider.getTransactionReceipt(txHash);
    } catch (err) {
      console.error('Failed to get transaction receipt:', err);
      return null;
    }
  }, []);

  // Utility functions
  const formatAddress = useCallback((address) => {
    return web3Provider.formatAddress(address);
  }, []);

  const getTransactionUrl = useCallback((txHash) => {
    return web3Provider.getTransactionUrl(txHash);
  }, []);

  const getAddressUrl = useCallback((address) => {
    return web3Provider.getAddressUrl(address);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Listen for account and network changes
  useEffect(() => {
    if (!isInitialized) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        setIsConnected(true);
        // Update provider state
        web3Provider.account = accounts[0];
        web3Provider.isConnected = true;
        refreshCounterValue();
      }
    };

    const handleChainChanged = () => {
      // Reload page on chain change to avoid state inconsistencies
      window.location.reload();
    };

    // Periodic check for connection state synchronization
    const checkConnectionState = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const isCurrentlyConnected = accounts.length > 0;
          
          if (isCurrentlyConnected !== isConnected) {
            if (isCurrentlyConnected) {
              setIsConnected(true);
              setAccount(accounts[0]);
              web3Provider.account = accounts[0];
              web3Provider.isConnected = true;
            } else {
              setIsConnected(false);
              setAccount(null);
              web3Provider.account = null;
              web3Provider.isConnected = false;
            }
          }
        } catch (err) {
          // Ignore errors in periodic check
        }
      }
    };

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check connection state every 2 seconds
      const interval = setInterval(checkConnectionState, 2000);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        clearInterval(interval);
      };
    }
  }, [isInitialized, isConnected, disconnectWallet, refreshCounterValue]);

  return {
    // State
    isConnected,
    account,
    isLoading,
    error,
    network,
    counterValue,
    isInitialized,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    incrementCounter,
    refreshCounterValue,
    
    // Utilities
    getBalance,
    getTransactionReceipt,
    formatAddress,
    getTransactionUrl,
    getAddressUrl,
    
    // Provider info
    isMetaMaskInstalled: web3Provider.isMetaMaskInstalled(),
  };
};