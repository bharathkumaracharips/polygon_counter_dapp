import React, { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';

const CounterControls = () => {
    const {
        isConnected,
        account,
        incrementCounter,
        isInitialized,
        getTransactionUrl,
        getTransactionReceipt
    } = useWeb3();

    const [transactionState, setTransactionState] = useState({
        hash: null,
        status: 'idle', // 'idle' | 'pending' | 'confirmed' | 'failed'
        error: null,
        gasUsed: null
    });

    const [isProcessing, setIsProcessing] = useState(false);

    // Reset transaction state
    const resetTransactionState = () => {
        setTransactionState({
            hash: null,
            status: 'idle',
            error: null,
            gasUsed: null
        });
    };

    // Handle increment button click
    const handleIncrement = async () => {
        if (!isConnected || !account) {
            setTransactionState(prev => ({
                ...prev,
                status: 'failed',
                error: 'Please connect your wallet first'
            }));
            return;
        }

        try {
            setIsProcessing(true);
            resetTransactionState();
            
            // Set transaction to pending
            setTransactionState(prev => ({
                ...prev,
                status: 'pending'
            }));

            // Execute the increment transaction
            const transaction = await incrementCounter();
            
            // Update transaction state with hash
            setTransactionState(prev => ({
                ...prev,
                hash: transaction.transactionHash,
                status: 'pending'
            }));

            // Wait for transaction confirmation and get receipt
            const receipt = await getTransactionReceipt(transaction.transactionHash);
            
            if (receipt && receipt.status) {
                setTransactionState(prev => ({
                    ...prev,
                    status: 'confirmed',
                    gasUsed: receipt.gasUsed
                }));
            } else {
                setTransactionState(prev => ({
                    ...prev,
                    status: 'failed',
                    error: 'Transaction failed on blockchain'
                }));
            }

        } catch (error) {
            console.error('Transaction failed:', error);
            
            let errorMessage = 'Transaction failed';
            
            // Handle specific error types
            if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds to complete transaction. Please add more MATIC to your wallet.';
            } else if (error.message.includes('User denied')) {
                errorMessage = 'Transaction was rejected by user';
            } else if (error.message.includes('gas')) {
                errorMessage = 'Transaction failed due to gas estimation error';
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setTransactionState(prev => ({
                ...prev,
                status: 'failed',
                error: errorMessage
            }));
        } finally {
            setIsProcessing(false);
        }
    };

    // Render transaction status
    const renderTransactionStatus = () => {
        if (transactionState.status === 'idle') {
            return null;
        }

        return (
            <div className="mt-4 p-4 rounded-lg border">
                {transactionState.status === 'pending' && (
                    <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="font-medium">Transaction Pending...</span>
                    </div>
                )}

                {transactionState.status === 'confirmed' && (
                    <div className="text-green-600">
                        <div className="flex items-center mb-2">
                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">Transaction Confirmed!</span>
                        </div>
                        <p className="text-sm text-gray-600">Counter has been successfully incremented.</p>
                    </div>
                )}

                {transactionState.status === 'failed' && (
                    <div className="text-red-600">
                        <div className="flex items-center mb-2">
                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="font-medium">Transaction Failed</span>
                        </div>
                        <p className="text-sm text-red-800">{transactionState.error}</p>
                    </div>
                )}

                {transactionState.hash && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            <p className="mb-1">
                                <span className="font-medium">Transaction Hash:</span>
                            </p>
                            <div className="flex items-center space-x-2">
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                                    {transactionState.hash}
                                </code>
                                <a
                                    href={getTransactionUrl(transactionState.hash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs"
                                >
                                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View on Polygonscan
                                </a>
                            </div>
                        </div>
                        
                        {transactionState.gasUsed && (
                            <p className="text-xs text-gray-500 mt-2">
                                Gas Used: {transactionState.gasUsed.toLocaleString()}
                            </p>
                        )}
                    </div>
                )}

                {(transactionState.status === 'confirmed' || transactionState.status === 'failed') && (
                    <button
                        type="button"
                        onClick={resetTransactionState}
                        className="mt-3 text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                        Clear Status
                    </button>
                )}
            </div>
        );
    };

    if (!isInitialized) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    Counter Controls
                </h2>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Counter Controls
            </h2>

            {!isConnected ? (
                <div className="text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                        <div className="flex items-center justify-center">
                            <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-sm text-yellow-800">
                                Please connect your wallet to increment the counter
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled
                        className="w-full bg-gray-300 text-gray-500 font-medium py-3 px-6 rounded-lg cursor-not-allowed"
                    >
                        Connect Wallet to Continue
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={isProcessing || transactionState.status === 'pending'}
                        className={`w-full font-medium py-3 px-6 rounded-lg transition-colors duration-200 ${
                            isProcessing || transactionState.status === 'pending'
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                    >
                        {isProcessing || transactionState.status === 'pending' ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-2"></div>
                                Processing...
                            </div>
                        ) : (
                            <>
                                <svg className="h-5 w-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Increment Counter
                            </>
                        )}
                    </button>

                    <p className="text-sm text-gray-600 mt-2">
                        Connected: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Unknown'}
                    </p>
                </div>
            )}

            {renderTransactionStatus()}
        </div>
    );
};

export default CounterControls;