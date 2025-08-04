import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CounterControls from '../CounterControls';
import WalletConnection from '../WalletConnection';
import CounterDisplay from '../CounterDisplay';

// Mock the useWeb3 hook
jest.mock('../../hooks/useWeb3');
import { useWeb3 } from '../../hooks/useWeb3';

describe('CounterControls Integration', () => {
    const mockUseWeb3 = {
        isConnected: false,
        account: null,
        incrementCounter: jest.fn(),
        isInitialized: true,
        getTransactionUrl: jest.fn((hash) => `https://amoy.polygonscan.com/tx/${hash}`),
        getTransactionReceipt: jest.fn(),
        connectWallet: jest.fn(),
        disconnectWallet: jest.fn(),
        switchNetwork: jest.fn(),
        refreshCounterValue: jest.fn(),
        counterValue: 0,
        isLoading: false,
        error: null,
        network: null,
        getBalance: jest.fn(),
        formatAddress: jest.fn(),
        getAddressUrl: jest.fn(),
        isMetaMaskInstalled: true
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useWeb3.mockReturnValue(mockUseWeb3);
    });

    it('should render CounterControls component without errors', () => {
        render(<CounterControls />);
        
        expect(screen.getByText('Counter Controls')).toBeInTheDocument();
        expect(screen.getByText('Please connect your wallet to increment the counter')).toBeInTheDocument();
    });

    it('should work alongside other Web3 components', () => {
        const TestApp = () => (
            <div className="space-y-6">
                <WalletConnection />
                <CounterDisplay />
                <CounterControls />
            </div>
        );

        render(<TestApp />);
        
        // Should render all components
        expect(screen.getByText('Wallet Connection')).toBeInTheDocument();
        expect(screen.getByText('Current Counter Value')).toBeInTheDocument();
        expect(screen.getByText('Counter Controls')).toBeInTheDocument();
    });

    it('should show increment button when wallet is connected', () => {
        useWeb3.mockReturnValue({
            ...mockUseWeb3,
            isConnected: true,
            account: '0x1234567890123456789012345678901234567890'
        });

        render(<CounterControls />);
        
        expect(screen.getByRole('button', { name: /increment counter/i })).toBeInTheDocument();
        expect(screen.getByText('Connected: 0x1234...7890')).toBeInTheDocument();
    });

    it('should handle component re-renders properly', () => {
        const { rerender } = render(<CounterControls />);
        
        // Initially not connected
        expect(screen.getByText('Please connect your wallet to increment the counter')).toBeInTheDocument();
        
        // Simulate wallet connection
        useWeb3.mockReturnValue({
            ...mockUseWeb3,
            isConnected: true,
            account: '0x1234567890123456789012345678901234567890'
        });
        
        rerender(<CounterControls />);
        
        // Should now show increment button
        expect(screen.getByRole('button', { name: /increment counter/i })).toBeInTheDocument();
    });

    it('should maintain proper styling and layout', () => {
        render(<CounterControls />);
        
        const container = screen.getByText('Counter Controls').closest('div');
        expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6');
    });

    it('should be accessible with proper ARIA attributes', () => {
        useWeb3.mockReturnValue({
            ...mockUseWeb3,
            isConnected: true,
            account: '0x1234567890123456789012345678901234567890'
        });

        render(<CounterControls />);
        
        const incrementButton = screen.getByRole('button', { name: /increment counter/i });
        expect(incrementButton).toBeInTheDocument();
        expect(incrementButton).toHaveAttribute('type', 'button');
    });
});