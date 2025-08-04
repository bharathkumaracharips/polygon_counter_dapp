import { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';

export default function WalletConnection() {
  const {
    isConnected,
    account,
    isLoading,
    error,
    network,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    formatAddress,
    getAddressUrl,
    isMetaMaskInstalled,
  } = useWeb3();

  const [connectionError, setConnectionError] = useState(null);

  // Handle wallet connection with error handling
  const handleConnect = async () => {
    try {
      setConnectionError(null);
      await connectWallet();
    } catch (err) {
      // Handle specific error types
      if (err.message.includes('User rejected')) {
        setConnectionError('Connection was rejected. Please try again and approve the connection request.');
      } else if (err.message.includes('MetaMask is not installed')) {
        setConnectionError('MetaMask is not installed. Please install MetaMask to continue.');
      } else if (err.message.includes('No accounts found')) {
        setConnectionError('No accounts found. Please make sure your wallet is unlocked.');
      } else {
        setConnectionError(err.message);
      }
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = async () => {
    try {
      setConnectionError(null);
      await disconnectWallet();
    } catch (err) {
      setConnectionError(err.message);
    }
  };

  // Handle network switching
  const handleNetworkSwitch = async () => {
    try {
      setConnectionError(null);
      await switchNetwork();
    } catch (err) {
      if (err.message.includes('User rejected')) {
        setConnectionError('Network switch was rejected. Please manually switch to Polygon Amoy testnet.');
      } else {
        setConnectionError(err.message);
      }
    }
  };

  // Display error message (prioritize connection error over general error)
  const displayError = connectionError || error;

  // MetaMask not installed view
  if (!isMetaMaskInstalled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-yellow-800">MetaMask Required</h3>
          </div>
        </div>
        
        <p className="text-yellow-700 mb-4">
          MetaMask is required to connect your wallet and interact with the blockchain. 
          Please install the MetaMask browser extension to continue.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Install MetaMask
          </a>
          
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Wallet Connection</h2>
        
        {/* Connection Status Indicator */}
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <span className={`text-sm font-medium ${
            isConnected ? 'text-green-700' : 'text-gray-600'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {displayError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
              <p className="text-sm text-red-700 mt-1">{displayError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Network Warning */}
      {isConnected && network && !network.isCorrectNetwork && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-orange-800">Wrong Network</h3>
              <p className="text-sm text-orange-700 mt-1 mb-3">
                Please switch to {network.expectedNetwork} to use this application.
              </p>
              <button
                onClick={handleNetworkSwitch}
                disabled={isLoading}
                className="bg-orange-600 text-white px-3 py-1.5 text-sm rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Switching...' : 'Switch Network'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Interface */}
      {!isConnected ? (
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-6">
            Connect your MetaMask wallet to interact with the counter on the blockchain.
          </p>
          
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium min-w-[140px]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
                Connect Wallet
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connected Account Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Wallet Connected</h3>
                  <p className="text-sm text-green-700">Ready to interact with the blockchain</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-600">Account:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {formatAddress(account)}
                </span>
                <a
                  href={getAddressUrl(account)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="View on Polygonscan"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
            </div>

            {network && network.isCorrectNetwork && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-600">Network:</span>
                <span className="text-sm text-green-600 font-medium">
                  {network.expectedNetwork}
                </span>
              </div>
            )}
          </div>

          {/* Disconnect Button */}
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}