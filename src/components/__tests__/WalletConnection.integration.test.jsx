import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WalletConnection from '../WalletConnection';

// Mock the Web3 provider and hooks
jest.mock('../../services/web3Provider', () => ({
  __esModule: true,
  default: {
    isMetaMaskInstalled: jest.fn(() => true),
    initialize: jest.fn(() => Promise.resolve()),
    connectWallet: jest.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890')),
    disconnectWallet: jest.fn(() => Promise.resolve()),
    switchToPolygonAmoy: jest.fn(() => Promise.resolve()),
    getCurrentNetwork: jest.fn(() => Promise.resolve({
      isCorrectNetwork: true,
      expectedNetwork: 'Polygon Amoy Testnet'
    })),
    formatAddress: jest.fn((addr) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`),
    getAddressUrl: jest.fn((addr) => `https://amoy.polygonscan.com/address/${addr}`),
    getCounterValue: jest.fn(() => Promise.resolve(0)),
  }
}));

describe('WalletConnection Integration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<WalletConnection />);
    expect(screen.getByText('Wallet Connection')).toBeInTheDocument();
  });

  it('should show connect button when wallet is not connected', () => {
    render(<WalletConnection />);
    expect(screen.getByRole('button', { name: /Connect Wallet/ })).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('should handle the complete connection flow', async () => {
    render(<WalletConnection />);
    
    // Initially disconnected
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    
    // Click connect button
    const connectButton = screen.getByRole('button', { name: /Connect Wallet/ });
    fireEvent.click(connectButton);
    
    // Should show loading state briefly
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  it('should display proper UI elements when connected', async () => {
    // Mock connected state
    const mockUseWeb3 = require('../../hooks/useWeb3');
    mockUseWeb3.useWeb3 = jest.fn(() => ({
      isConnected: true,
      account: '0x1234567890123456789012345678901234567890',
      isLoading: false,
      error: null,
      network: {
        isCorrectNetwork: true,
        expectedNetwork: 'Polygon Amoy Testnet'
      },
      connectWallet: jest.fn(),
      disconnectWallet: jest.fn(),
      switchNetwork: jest.fn(),
      formatAddress: jest.fn((addr) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`),
      getAddressUrl: jest.fn((addr) => `https://amoy.polygonscan.com/address/${addr}`),
      isMetaMaskInstalled: true,
    }));

    render(<WalletConnection />);
    
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Wallet Connected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Disconnect Wallet/ })).toBeInTheDocument();
  });

  it('should handle MetaMask not installed scenario', () => {
    // Mock MetaMask not installed
    const mockUseWeb3 = require('../../hooks/useWeb3');
    mockUseWeb3.useWeb3 = jest.fn(() => ({
      isConnected: false,
      account: null,
      isLoading: false,
      error: null,
      network: null,
      connectWallet: jest.fn(),
      disconnectWallet: jest.fn(),
      switchNetwork: jest.fn(),
      formatAddress: jest.fn(),
      getAddressUrl: jest.fn(),
      isMetaMaskInstalled: false,
    }));

    render(<WalletConnection />);
    
    expect(screen.getByText('MetaMask Required')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Install MetaMask/ })).toBeInTheDocument();
  });
});