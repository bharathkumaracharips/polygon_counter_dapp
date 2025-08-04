import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';

const CounterDisplay = () => {
    const {
        counterValue,
        refreshCounterValue,
        isInitialized,
        isConnected
    } = useWeb3();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);

    // Refresh counter value with loading state
    const handleRefresh = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await refreshCounterValue();
            setLastRefresh(new Date());
        } catch (err) {
            setError('Failed to fetch counter value. Please try again.');
            console.error('Counter refresh failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-refresh on component mount and when wallet connects
    useEffect(() => {
        if (isInitialized) {
            handleRefresh();
        }
    }, [isInitialized, isConnected]);

    // Auto-refresh every 30 seconds when connected
    useEffect(() => {
        if (!isConnected || !isInitialized) return;

        const interval = setInterval(() => {
            handleRefresh();
        }, 30000);

        return () => clearInterval(interval);
    }, [isConnected, isInitialized]);

    if (!isInitialized) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Current Counter Value
            </h2>

            {error ? (
                <div className="mb-4">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <div className="mb-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading...</span>
                        </div>
                    ) : (
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                                {counterValue}
                            </div>
                            <p className="text-gray-600 text-sm">
                                Total increments on the blockchain
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>

                {lastRefresh && (
                    <span className="text-xs">
                        Last updated: {lastRefresh.toLocaleTimeString()}
                    </span>
                )}
            </div>

            {!isConnected && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                        Connect your wallet to see real-time updates
                    </p>
                </div>
            )}
        </div>
    );
};

export default CounterDisplay;