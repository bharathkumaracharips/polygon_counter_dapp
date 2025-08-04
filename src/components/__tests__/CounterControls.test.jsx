import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CounterControls from '../CounterControls';
import { useWeb3 } from '../../hooks/useWeb3';

// Mock the useWeb3 hook
jest.mock('../../hooks/useWeb3');

describe('CounterControls', () => {
    const mockUseWeb3 = {
        isConnected: false,
        account: null,
        incrementCounter: jest.fn(),
        isInitialized: true,
        getTransactionUrl: jest.fn((hash) => `https://amoy.polygonscan.com/tx/${hash}`),
        getTransactionReceipt: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useWeb3.mockReturnValue(mockUseWeb3);
    });

    describe('Component Rendering', () => {
        it('should render loading state when not initialized', () => {
            useWeb3.mockReturnValue({
                ...mockUseWeb3,
                isInitialized: false
            });

            render(<CounterControls />);
            
            expect(screen.getByText('Counter Controls')).toBeInTheDocument();
            // Should show loading skeleton
            const loadingElements = document.querySelectorAll('.animate-pulse');
            expect(loadingElements.length).toBeGreaterThan(0);
        });

        it('should render wallet connection prompt when not connected', () => {
            render(<CounterControls />);
            
            expect(screen.getByText('Counter Controls')).toBeInTheDocument();
            expect(screen.getByText('Please connect your wallet to increment the counter')).toBeInTheDocument();
            expect(screen.getByText('Connect Wallet to Continue')).toBeInTheDocument();
            
            const button = screen.getByRole('button', { name: /connect wallet to continue/i });
            expect(button).toBeDisabled();
        });

        it('should render increment button when wallet is connected', () => {
            useWeb3.mockReturnValue({
                ...mockUseWeb3,
                isConnected: true,
                account: '0x1234567890123456789012345678901234567890'
            });

            render(<CounterControls />);
            
            expect(screen.getByText('Counter Controls')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /increment counter/i })).toBeInTheDocument();
            expect(screen.getByText('Connected: 0x1234...7890')).toBeInTheDocument();
        });
    });

    describe('Increment Counter Functionality', () => {
        beforeEach(() => {
            useWeb3.mockReturnValue({
                ...mockUseWeb3,
                isConnected: true,
                account: '0x1234567890123456789012345678901234567890'
            });
        });

        it('should handle successful transaction', async () => {
            const mockTransaction = {
                transactionHash: '0xabcdef123456789'
            };
            const mockReceipt = {
                status: true,
                gasUsed: 50000
            };

            // Make incrementCounter return a promise that resolves after a delay
            mockUseWeb3.incrementCounter.mockImplementation(() => 
                new Promise(resolve => setTimeout(() => resolve(mockTransaction), 50))
            );
            mockUseWeb3.getTransactionReceipt.mockResolvedValue(mockReceipt);

            render(<CounterControls />);
            
            const incrementButton = screen.getByRole('button', { name: /increment counter/i });
            fireEvent.click(incrementButton);

            // Should show pending state
            await waitFor(() => {
                expect(screen.getByText('Processing...')).toBeInTheDocument();
            });

            // Wait for transaction to complete and show success state
            await waitFor(() => {
                expect(screen.getByText('Transaction Confirmed!')).toBeInTheDocument();
                expect(screen.getByText('Counter has been successfully incremented.')).toBeInTheDocument();
                expect(screen.getByText('0xabcdef123456789')).toBeInTheDocument();
                expect(screen.getByText('Gas Used: 50,000')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Should have Polygonscan link
            const polygonscanLink = screen.getByRole('link', { name: /view on polygonscan/i });
            expect(polygonscanLink).toHaveAttribute('href', 'https://amoy.polygonscan.com/tx/0xabcdef123456789');
            expect(polygonscanLink).toHaveAttribute('target', '_blank');
        });

        it('should handle insufficient funds error', async () => {
            const insufficientFundsError = new Error('insufficient funds for gas * price + value');
            mockUseWeb3.incrementCounter.mockRejectedValue(insufficientFundsError);

            render(<CounterControls />);
            
            const incrementButton = screen.getByRole('button', { name: /increment counter/i });
            fireEvent.click(incrementButton);

            await waitFor(() => {
                expect(screen.getByText('Transaction Failed')).toBeInTheDocument();
                expect(screen.getByText('Insufficient funds to complete transaction. Please add more MATIC to your wallet.')).toBeInTheDocument();
            });
        });

        it('should handle user rejection error', async () => {
            const userRejectionError = new Error('User denied transaction signature');
            mockUseWeb3.incrementCounter.mockRejectedValue(userRejectionError);

            render(<CounterControls />);
            
            const incrementButton = screen.getByRole('button', { name: /increment counter/i });
            fireEvent.click(incrementButton);

            await waitFor(() => {
                expect(screen.getByText('Transaction Failed')).toBeInTheDocument();
                expect(screen.getByText('Transaction was rejected by user')).toBeInTheDocument();
            });
        });

        it('should handle gas estimation error', async () => {
            const gasError = new Error('gas estimation failed');
            mockUseWeb3.incrementCounter.mockRejectedValue(gasError);

            render(<CounterControls />);
            
            const incrementButton = screen.getByRole('button', { name: /increment counter/i });
            fireEvent.click(incrementButton);

            await waitFor(() => {
                expect(screen.getByText('Transaction Failed')).toBeInTheDocument();
                expect(screen.getByText('Transaction failed due to gas estimation error')).toBeInTheDocument();
            });
        });

        it('should handle network error', async () => {
            const networkError = new Error('network connection failed');
            mockUseWeb3.incrementCounter.mockRejectedValue(networkError);

            render(<CounterControls />);
            
            const incrementButton = screen.getByRole('button', { name: /increment counter/i });
            fireEvent.click(incrementButton);

            await waitFor(() => {
                expect(screen.getByText('Transaction Failed')).toBeInTheDocument();
                expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument();
            });
        });

        it('should handle generic transaction error', async () => {
            const genericError = new Error('Something went wrong');
            mockUseWeb3.incrementCounter.mockRejectedValue(genericError);

            render(<CounterControls />);
            
            const incrementButton = screen.getByRole('button', { name: /increment counter/i });
            fireEvent.click(incrementButton);

            await waitFor(() => {
                expect(screen.getByText('Transaction Failed')).toBeInTheDocument();
                expect(screen.getByText('Something went wrong')).toBeInTheDocument();
            });
        });

        it('should handle failed transaction receipt', async () => {
            const mockTransaction = {
                transactionHash: '0xabcdef123456789'
            };
            const mockReceipt = {
                status: false // Transaction failed on blockchain
            };

            mockUseWeb3.incrementCounter.mockResolvedValue(mockTransaction);
            mockUseWeb3.getTransactionReceipt.mockResolvedValue(mockReceipt);

            render(<CounterControls />);
            
            const incrementButton = screen.getByRole('button', { name: /increment counter/i });
            fireEvent.click(incrementButton);

            await waitFor(() => {
                expect(screen.getByText('Transaction Failed')).toBeInTheDocument();
                expect(screen.getByText('Transaction failed on blockchain')).toBeInTheDocument();
            });
        });
    });

    describe('Transaction Status Management', () => {
        beforeEach(() => {
            useWeb3.mockReturnValue({
                ...mockUseWeb3,
                isConnected: true,
                account: '0x1234567890123456789012345678901234567890'
            });
        });

        it('should disable button during transaction processing', async () => {
            const mockTransaction = {
                transactionHash: '0xabcdef123456789'
            };
            
            // Make incrementCounter hang to test pending state
            mockUseWeb3.incrementCounter.mockImplementation(() => 
                new Promise(resolve => setTimeout(() => resolve(mockTransaction), 1000))
            );

            render(<CounterControls />);
            
            const incrementButton = screen.getByRole('button', { name: /increment counter/i });
            fireEvent.click(incrementButton);

            // Button should be disabled during processing
            await waitFor(() => {
                expect(incrementButton).toBeDisabled();
                expect(screen.getByText('Processing...')).toBeInTheDocument();
            });
        });

        it('should clear transaction status when clear button is clicked', async () => {
            const mockTransaction = {
                transactionHash: '0xabcdef123456789'
            };
            const mockReceipt = {
                status: true,
                gasUsed: 50000
            };

            mockUseWeb3.incrementCounter.mockResolvedValue(mockTransaction);
            mockUseWeb3.getTransactionReceipt.mockResolvedValue(mockReceipt);

            render(<CounterControls />);
            
            const incrementButton = screen.getByRole('button', { name: /increment counter/i });
            fireEvent.click(incrementButton);

            // Wait for success state
            await waitFor(() => {
                expect(screen.getByText('Transaction Confirmed!')).toBeInTheDocument();
            });

            // Click clear status
            const clearButton = screen.getByRole('button', { name: /clear status/i });
            fireEvent.click(clearButton);

            // Status should be cleared
            expect(screen.queryByText('Transaction Confirmed!')).not.toBeInTheDocument();
            expect(screen.queryByText('0xabcdef123456789')).not.toBeInTheDocument();
        });
    });

    describe('Wallet Connection Requirements', () => {
        it('should show error when trying to increment without wallet connection', async () => {
            useWeb3.mockReturnValue({
                ...mockUseWeb3,
                isConnected: false,
                account: null
            });

            render(<CounterControls />);
            
            // Should show connection prompt, not increment button
            expect(screen.getByText('Please connect your wallet to increment the counter')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /increment counter/i })).not.toBeInTheDocument();
        });

        it('should handle wallet disconnection during transaction', async () => {
            // Start with connected wallet
            const mockUseWeb3Connected = {
                ...mockUseWeb3,
                isConnected: true,
                account: '0x1234567890123456789012345678901234567890'
            };

            useWeb3.mockReturnValue(mockUseWeb3Connected);

            render(<CounterControls />);
            
            expect(screen.getByRole('button', { name: /increment counter/i })).toBeInTheDocument();

            // Simulate wallet disconnection
            useWeb3.mockReturnValue({
                ...mockUseWeb3,
                isConnected: false,
                account: null
            });

            // Re-render to simulate state change
            render(<CounterControls />);
            
            expect(screen.getByText('Please connect your wallet to increment the counter')).toBeInTheDocument();
        });
    });

    describe('Accessibility and UX', () => {
        it('should have proper button states and labels', () => {
            useWeb3.mockReturnValue({
                ...mockUseWeb3,
                isConnected: true,
                account: '0x1234567890123456789012345678901234567890'
            });

            render(<CounterControls />);
            
            const incrementButton = screen.getByRole('button', { name: /increment counter/i });
            expect(incrementButton).toBeEnabled();
            expect(incrementButton).toHaveClass('bg-blue-600');
        });

        it('should show loading indicators during processing', async () => {
            useWeb3.mockReturnValue({
                ...mockUseWeb3,
                isConnected: true,
                account: '0x1234567890123456789012345678901234567890'
            });

            const mockTransaction = {
                transactionHash: '0xabcdef123456789'
            };
            
            mockUseWeb3.incrementCounter.mockImplementation(() => 
                new Promise(resolve => setTimeout(() => resolve(mockTransaction), 100))
            );

            render(<CounterControls />);
            
            const incrementButton = screen.getByRole('button', { name: /increment counter/i });
            fireEvent.click(incrementButton);

            // Should show loading spinner
            await waitFor(() => {
                const spinners = document.querySelectorAll('.animate-spin');
                expect(spinners.length).toBeGreaterThan(0);
            });
        });
    });
});