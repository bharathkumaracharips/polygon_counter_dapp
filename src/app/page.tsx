'use client';

import WalletConnection from '../components/WalletConnection';
import CounterDisplay from '../components/CounterDisplay';
import CounterControls from '../components/CounterControls';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Web3 Counter App
          </h1>
          <p className="text-lg text-gray-600">
            A decentralized counter on Polygon Amoy testnet
          </p>
        </div>

        {/* Main App Content */}
        <div className="space-y-6">
          {/* Wallet Connection Section */}
          <WalletConnection />

          {/* Counter Display and Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CounterDisplay />
            <CounterControls />
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">
              How to Use
            </h2>
            <ol className="list-decimal list-inside text-blue-700 space-y-2">
              <li>Connect your MetaMask wallet using the button above</li>
              <li>Make sure you're on the Polygon Amoy testnet</li>
              <li>View the current counter value in the display panel</li>
              <li>Click "Increment Counter" to add 1 to the shared counter</li>
              <li>Monitor your transaction status and view on Polygonscan</li>
            </ol>
          </div>

          {/* Network Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Network Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-medium">Network:</p>
                <p>Polygon Amoy Testnet</p>
              </div>
              <div>
                <p className="font-medium">Chain ID:</p>
                <p>80002</p>
              </div>
              <div>
                <p className="font-medium">Currency:</p>
                <p>MATIC (testnet)</p>
              </div>
              <div>
                <p className="font-medium">Explorer:</p>
                <a 
                  href="https://amoy.polygonscan.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Polygonscan Amoy
                </a>
              </div>
            </div>
          </div>

          {/* Get Test MATIC */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-3">
              Need Test MATIC?
            </h2>
            <p className="text-yellow-700 mb-3">
              You'll need some test MATIC to pay for transaction fees. Get free test tokens from the Polygon faucet:
            </p>
            <a
              href="https://faucet.polygon.technology/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Get Test MATIC
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p className="text-sm">
            Built with Next.js, Web3.js, and deployed on Polygon Amoy testnet
          </p>
        </footer>
      </div>
    </div>
  );
}
