/**
 * Integration tests for Web3Provider service
 * These tests verify that the service can be imported and basic methods work
 */

// Mock the Web3 import to avoid actual blockchain connections
jest.mock('web3', () => ({
  Web3: jest.fn().mockImplementation(() => ({
    eth: {
      Contract: jest.fn().mockImplementation(() => ({
        methods: {
          getCount: jest.fn(() => ({
            call: jest.fn().mockResolvedValue('42'),
          })),
          increment: jest.fn(() => ({
            estimateGas: jest.fn().mockResolvedValue(50000),
            send: jest.fn().mockResolvedValue({ transactionHash: '0xabc123' }),
          })),
        },
      })),
      getBalance: jest.fn().mockResolvedValue('1000000000000000000'),
      getTransactionReceipt: jest.fn().mockResolvedValue({ status: true }),
    },
    utils: {
      fromWei: jest.fn((value) => (parseFloat(value) / Math.pow(10, 18)).toString()),
      toWei: jest.fn((value) => (parseFloat(value) * Math.pow(10, 18)).toString()),
    },
  })),
}));

// Mock the contract JSON
jest.mock('../../contracts/Counter.json', () => ({
  abi: [
    {
      inputs: [],
      name: 'getCount',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'increment',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
}));

describe('Web3Provider Integration', () => {
  let web3Provider;

  beforeAll(() => {
    // Set up environment
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';
    
    // Mock window.ethereum
    global.window = {
      ethereum: {
        isMetaMask: true,
        request: jest.fn(),
        on: jest.fn(),
        removeListener: jest.fn(),
      },
    };
  });

  beforeEach(async () => {
    // Import the service fresh for each test
    jest.resetModules();
    const { default: provider } = await import('../web3Provider');
    web3Provider = provider;
  });

  test('should import Web3Provider service successfully', () => {
    expect(web3Provider).toBeDefined();
    expect(typeof web3Provider.initialize).toBe('function');
    expect(typeof web3Provider.connectWallet).toBe('function');
    expect(typeof web3Provider.getCounterValue).toBe('function');
    expect(typeof web3Provider.incrementCounter).toBe('function');
  });

  test('should initialize successfully', async () => {
    const result = await web3Provider.initialize();
    expect(result).toBe(true);
    expect(web3Provider.web3).toBeDefined();
    expect(web3Provider.contract).toBeDefined();
  });

  test('should detect MetaMask installation', () => {
    const isInstalled = web3Provider.isMetaMaskInstalled();
    expect(isInstalled).toBe(true);
  });

  test('should format addresses correctly', () => {
    const address = '0x1234567890123456789012345678901234567890';
    const formatted = web3Provider.formatAddress(address);
    expect(formatted).toBe('0x1234...7890');
  });

  test('should generate correct blockchain explorer URLs', () => {
    const txHash = '0xabc123def456';
    const address = '0x1234567890123456789012345678901234567890';
    
    const txUrl = web3Provider.getTransactionUrl(txHash);
    const addressUrl = web3Provider.getAddressUrl(address);
    
    expect(txUrl).toBe('https://amoy.polygonscan.com/tx/0xabc123def456');
    expect(addressUrl).toBe('https://amoy.polygonscan.com/address/0x1234567890123456789012345678901234567890');
  });

  test('should read counter value after initialization', async () => {
    await web3Provider.initialize();
    const counterValue = await web3Provider.getCounterValue();
    expect(counterValue).toBe(42);
  });

  test('should handle wallet connection state', () => {
    expect(web3Provider.getConnectionStatus()).toBe(false);
    expect(web3Provider.getCurrentAccount()).toBe(null);
  });

  test('should provide utility methods', () => {
    expect(typeof web3Provider.weiToEther).toBe('function');
    expect(typeof web3Provider.etherToWei).toBe('function');
    expect(typeof web3Provider.formatAddress).toBe('function');
  });
});