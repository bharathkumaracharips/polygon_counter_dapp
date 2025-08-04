import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WalletConnection from '../WalletConnection';
import { useWeb3 } from '../../hooks/useWeb3';

// Mock the useWeb3 hook
jest.mock('../../hooks/useWeb3');

describe('WalletConnection Component', () => {
  const mockUseWeb3 = {
    isConnected: false,
    account: null,
    isLoading: false,
    error: null,
    network: null,
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    switchNetwork: jest.fn(),
    formatAddress: jest.fn((addr) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`),
    getAddressUrl: jest.fn((addr) => `https://amoy.polygonscan.com/address/${addr}`),
    isMetaMaskInstalled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useWeb3.mockReturnValue(mockUseWeb3);
  });

  describe('MetaMask not installed', () => {
    it('should display MetaMask installation prompt when MetaMask is not installed', () => {
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        isMetaMaskInstalled: false,
      });

      render(<WalletConnection />);

      expect(screen.getByText('MetaMask Required')).toBeInTheDocument();
      expect(screen.getByText(/MetaMask is required to connect your wallet/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Install MetaMask/ })).toHaveAttribute(
        'href',
        'https://metamask.io/download/'
      );
    });

    it('should have refresh page button when MetaMask is not installed', () => {
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        isMetaMaskInstalled: false,
      });

      render(<WalletConnection />);

      const refreshButton = screen.getByRole('button', { name: /Refresh Page/ });
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Wallet not connected', () => {
    it('should display connect wallet button when wallet is not connected', () => {
      render(<WalletConnection />);

      expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Connect Wallet/ })).toBeInTheDocument();
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    it('should call connectWallet when connect button is clicked', async () => {
      render(<WalletConnection />);

      const connectButton = screen.getByRole('button', { name: /Connect Wallet/ });
      fireEvent.click(connectButton);

      expect(mockUseWeb3.connectWallet).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when connecting', () => {
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        isLoading: true,
      });

      render(<WalletConnection />);

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Connecting.../ })).toBeDisabled();
    });
  });

  describe('Wallet connected', () => {
    const connectedMockData = {
      ...mockUseWeb3,
      isConnected: true,
      account: '0x1234567890123456789012345678901234567890',
      network: {
        isCorrectNetwork: true,
        expectedNetwork: 'Polygon Amoy Testnet',
      },
    };

    it('should display connected wallet information', () => {
      useWeb3.mockReturnValue(connectedMockData);

      render(<WalletConnection />);

      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('Wallet Connected')).toBeInTheDocument();
      expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
      expect(screen.getByText('Polygon Amoy Testnet')).toBeInTheDocument();
    });

    it('should have disconnect button when wallet is connected', () => {
      useWeb3.mockReturnValue(connectedMockData);

      render(<WalletConnection />);

      const disconnectButton = screen.getByRole('button', { name: /Disconnect Wallet/ });
      expect(disconnectButton).toBeInTheDocument();
    });

    it('should call disconnectWallet when disconnect button is clicked', () => {
      useWeb3.mockReturnValue(connectedMockData);

      render(<WalletConnection />);

      const disconnectButton = screen.getByRole('button', { name: /Disconnect Wallet/ });
      fireEvent.click(disconnectButton);

      expect(mockUseWeb3.disconnectWallet).toHaveBeenCalledTimes(1);
    });

    it('should display Polygonscan link for connected account', () => {
      useWeb3.mockReturnValue(connectedMockData);

      render(<WalletConnection />);

      const polygonscanLink = screen.getByTitle('View on Polygonscan');
      expect(polygonscanLink).toHaveAttribute(
        'href',
        'https://amoy.polygonscan.com/address/0x1234567890123456789012345678901234567890'
      );
    });
  });

  describe('Wrong network', () => {
    it('should display network warning when on wrong network', () => {
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        isConnected: true,
        account: '0x1234567890123456789012345678901234567890',
        network: {
          isCorrectNetwork: false,
          expectedNetwork: 'Polygon Amoy Testnet',
        },
      });

      render(<WalletConnection />);

      expect(screen.getByText('Wrong Network')).toBeInTheDocument();
      expect(screen.getByText(/Please switch to Polygon Amoy Testnet/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch Network/ })).toBeInTheDocument();
    });

    it('should call switchNetwork when switch network button is clicked', () => {
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        isConnected: true,
        account: '0x1234567890123456789012345678901234567890',
        network: {
          isCorrectNetwork: false,
          expectedNetwork: 'Polygon Amoy Testnet',
        },
      });

      render(<WalletConnection />);

      const switchButton = screen.getByRole('button', { name: /Switch Network/ });
      fireEvent.click(switchButton);

      expect(mockUseWeb3.switchNetwork).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should display general error from useWeb3 hook', () => {
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        error: 'Something went wrong',
      });

      render(<WalletConnection />);

      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should handle user rejection error during connection', async () => {
      const mockConnectWallet = jest.fn().mockRejectedValue(new Error('User rejected the request'));
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        connectWallet: mockConnectWallet,
      });

      render(<WalletConnection />);

      const connectButton = screen.getByRole('button', { name: /Connect Wallet/ });
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/Connection was rejected/)).toBeInTheDocument();
      });
    });

    it('should handle MetaMask not installed error during connection', async () => {
      const mockConnectWallet = jest.fn().mockRejectedValue(new Error('MetaMask is not installed'));
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        connectWallet: mockConnectWallet,
      });

      render(<WalletConnection />);

      const connectButton = screen.getByRole('button', { name: /Connect Wallet/ });
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/MetaMask is not installed/)).toBeInTheDocument();
      });
    });

    it('should handle no accounts found error during connection', async () => {
      const mockConnectWallet = jest.fn().mockRejectedValue(new Error('No accounts found'));
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        connectWallet: mockConnectWallet,
      });

      render(<WalletConnection />);

      const connectButton = screen.getByRole('button', { name: /Connect Wallet/ });
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/No accounts found/)).toBeInTheDocument();
      });
    });

    it('should handle network switch rejection error', async () => {
      const mockSwitchNetwork = jest.fn().mockRejectedValue(new Error('User rejected the request'));
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        isConnected: true,
        account: '0x1234567890123456789012345678901234567890',
        network: {
          isCorrectNetwork: false,
          expectedNetwork: 'Polygon Amoy Testnet',
        },
        switchNetwork: mockSwitchNetwork,
      });

      render(<WalletConnection />);

      const switchButton = screen.getByRole('button', { name: /Switch Network/ });
      fireEvent.click(switchButton);

      await waitFor(() => {
        expect(screen.getByText(/Network switch was rejected/)).toBeInTheDocument();
      });
    });
  });
});