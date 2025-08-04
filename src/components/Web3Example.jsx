/**
 * Example component demonstrating Web3Provider usage
 * This shows how to use the useWeb3 hook in a React component
 */

import { useWeb3 } from '../hooks/useWeb3';

export default function Web3Example() {
  const {
    isConnected,
    account,
    isLoading,
    error,
    network,
    counterValue,
    isInitialized,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    incrementCounter,
    refreshCounterValue,
    formatAddress,
    getTransactionUrl,
    isMetaMaskInstalled,
  } = useWeb3();

  if (!isInitialized) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Initializing Web3...</p>
      </div>
    );
  }

  if (!isMetaMaskInstalled) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">MetaMask Required</h3>
        <p className="text-yellow-700 mb-4">
          Please install MetaMask to use this application.
        </p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Web3 Counter App
      </h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Network Status */}
      {network && (
        <div className={`p-4 rounded-lg border ${
          network.isCorrectNetwork 
            ? 'bg-green-50 border-green-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <h3 className="font-semibold mb-2">
            Network Status: {network.isCorrectNetwork ? '✅ Connected' : '⚠️ Wrong Network'}
          </h3>
          {!network.isCorrectNetwork && (
            <div>
              <p className="text-orange-700 mb-2">
                Please switch to {network.expectedNetwork}
              </p>
              <button
                onClick={switchNetwork}
                disabled={isLoading}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Switching...' : 'Switch Network'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Wallet Connection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
        
        {!isConnected ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Connect your wallet to get started</p>
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Connected Account:</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {formatAddress(account)}
              </span>
            </div>
            <button
              onClick={disconnectWallet}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>

      {/* Counter Display and Controls */}
      {isConnected && network?.isCorrectNetwork && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Counter</h2>
          
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-blue-600">
              {counterValue}
            </div>
            
            <div className="space-x-3">
              <button
                onClick={incrementCounter}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Processing...' : 'Increment Counter'}
              </button>
              
              <button
                onClick={refreshCounterValue}
                disabled={isLoading}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">How to Use</h3>
        <ol className="list-decimal list-inside text-blue-700 space-y-1">
          <li>Make sure MetaMask is installed and unlocked</li>
          <li>Connect your wallet using the button above</li>
          <li>Switch to Polygon Amoy testnet if prompted</li>
          <li>Click "Increment Counter" to increase the counter value</li>
          <li>The counter value is stored on the blockchain and shared with all users</li>
        </ol>
      </div>
    </div>
  );
}