/**
 * Tests for useWeb3 hook
 */

import { renderHook, act } from '@testing-library/react';

// Mock the web3Provider service
const mockWeb3Provider = {
  initialize: jest.fn().mockResolvedValue(true),
  isMetaMaskInstalled: jest.fn().mockReturnValue(true),
  connectWallet: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
  disconnectWallet: jest.fn().mockResolvedValue(undefined),
  getConnectionStatus: jest.fn().mockReturnValue(false),
  getCurrentAccount: jest.fn().mockReturnValue(null),
  getCurrentNetwork: jest.fn().mockResolvedValue({ chainId: '0x13882', isCorrectNetwork: true }),
  switchToPolygonAmoy: jest.fn().mockResolvedValue(true),
  getCounterValue: jest.fn().mockResolvedValue(42),
  incrementCounter: jest.fn().mockResolvedValue({ transactionHash: '0xabc123' }),
  getAccountBalance: jest.fn().mockResolvedValue('1.0'),
  getTransactionReceipt: jest.fn().mockResolvedValue({ status: true }),
  formatAddress: jest.fn((addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''),
  getTransactionUrl: jest.fn((hash) => `https://amoy.polygonscan.com/tx/${hash}`),
  getAddressUrl: jest.fn((addr) => `https://amoy.polygonscan.com/address/${addr}`),
};

jest.mock('../../services/web3Provider', () => mockWeb3Provider);

// Import after mock
const { useWeb3 } = require('../../hooks/useWeb3');

describe('useWeb3 Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with default state', async () => {
    const { result } = renderHook(() => useWeb3());

    // Wait for initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.account).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.counterValue).toBe(42);
    expect(result.current.isInitialized).toBe(true);
  });

  test('should provide all expected methods', async () => {
    const { result } = renderHook(() => useWeb3());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(typeof result.current.connectWallet).toBe('function');
    expect(typeof result.current.disconnectWallet).toBe('function');
    expect(typeof result.current.switchNetwork).toBe('function');
    expect(typeof result.current.incrementCounter).toBe('function');
    expect(typeof result.current.refreshCounterValue).toBe('function');
    expect(typeof result.current.getBalance).toBe('function');
    expect(typeof result.current.getTransactionReceipt).toBe('function');
    expect(typeof result.current.formatAddress).toBe('function');
    expect(typeof result.current.getTransactionUrl).toBe('function');
    expect(typeof result.current.getAddressUrl).toBe('function');
  });

  test('should connect wallet successfully', async () => {
    const { result } = renderHook(() => useWeb3());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(mockWeb3Provider.connectWallet).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(true);
    expect(result.current.account).toBe('0x1234567890123456789012345678901234567890');
  });

  test('should disconnect wallet successfully', async () => {
    const { result } = renderHook(() => useWeb3());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // First connect
    await act(async () => {
      await result.current.connectWallet();
    });

    // Then disconnect
    await act(async () => {
      await result.current.disconnectWallet();
    });

    expect(mockWeb3Provider.disconnectWallet).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.account).toBe(null);
  });

  test('should handle errors gracefully', async () => {
    const errorMessage = 'Connection failed';
    mockWeb3Provider.connectWallet.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useWeb3());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.isConnected).toBe(false);
  });

  test('should increment counter successfully', async () => {
    const { result } = renderHook(() => useWeb3());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Connect wallet first
    await act(async () => {
      await result.current.connectWallet();
    });

    // Increment counter
    let transaction;
    await act(async () => {
      transaction = await result.current.incrementCounter();
    });

    expect(mockWeb3Provider.incrementCounter).toHaveBeenCalled();
    expect(transaction.transactionHash).toBe('0xabc123');
  });

  test('should provide utility functions', async () => {
    const { result } = renderHook(() => useWeb3());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const address = '0x1234567890123456789012345678901234567890';
    const txHash = '0xabc123';

    const formattedAddress = result.current.formatAddress(address);
    const txUrl = result.current.getTransactionUrl(txHash);
    const addressUrl = result.current.getAddressUrl(address);

    expect(formattedAddress).toBe('0x1234...7890');
    expect(txUrl).toBe('https://amoy.polygonscan.com/tx/0xabc123');
    expect(addressUrl).toBe('https://amoy.polygonscan.com/address/0x1234567890123456789012345678901234567890');
  });
});