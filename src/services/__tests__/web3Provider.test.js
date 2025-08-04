/**
 * Tests for Web3Provider service
 * Note: These are basic unit tests. Integration tests would require a test blockchain.
 */

// Mock Web3 and window.ethereum
const mockWeb3 = {
  eth: {
    Contract: jest.fn(),
    getBalance: jest.fn(),
    getTransactionReceipt: jest.fn(),
  },
  utils: {
    fromWei: jest.fn((value) => (parseFloat(value) / Math.pow(10, 18)).toString()),
    toWei: jest.fn((value) => (parseFloat(value) * Math.pow(10, 18)).toString()),
  },
};

const mockEthereum = {
  isMetaMask: true,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

// Mock the Web3 constructor
jest.mock('web3', () => ({
  Web3: jest.fn(() => mockWeb3),
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

// Import after mocks
const web3Provider = require('../web3Provider').default;

describe('Web3Provider', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock window.ethereum
    global.window = {
      ethereum: mockEthereum,
    };
    
    // Mock environment variable
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';
    
    // Reset provider state
    web3Provider.web3 = null;
    web3Provider.contract = null;
    web3Provider.account = null;
    web3Provider.isConnected = false;
  });

  afterEach(() => {
    delete global.window;
  });

  describe('initialize', () => {
    it('should initialize Web3 with MetaMask provider', async () => {
      const result = await web3Provider.initialize();
      
      expect(result).toBe(true);
      expect(web3Provider.web3).toBeDefined();
      expect(web3Provider.contract).toBeDefined();
    });

    it('should initialize Web3 with RPC provider when MetaMask is not available', async () => {
      delete global.window.ethereum;
      
      const result = await web3Provider.initialize();
      
      expect(result).toBe(true);
      expect(web3Provider.web3).toBeDefined();
    });

    it('should throw error when initialization fails', async () => {
      // Mock Web3 constructor to throw
      const { Web3 } = require('web3');
      Web3.mockImplementationOnce(() => {
        throw new Error('Initialization failed');
      });

      await expect(web3Provider.initialize()).rejects.toThrow('Failed to initialize Web3 provider');
    });
  });

  describe('isMetaMaskInstalled', () => {
    it('should return true when MetaMask is installed', () => {
      expect(web3Provider.isMetaMaskInstalled()).toBe(true);
    });

    it('should return false when MetaMask is not installed', () => {
      delete global.window.ethereum;
      expect(web3Provider.isMetaMaskInstalled()).toBe(false);
    });

    it('should return false when ethereum is not MetaMask', () => {
      global.window.ethereum.isMetaMask = false;
      expect(web3Provider.isMetaMaskInstalled()).toBe(false);
    });
  });

  describe('connectWallet', () => {
    beforeEach(async () => {
      await web3Provider.initialize();
    });

    it('should connect wallet successfully', async () => {
      const mockAccounts = ['0x1234567890123456789012345678901234567890'];
      mockEthereum.request
        .mockResolvedValueOnce(mockAccounts) // eth_requestAccounts
        .mockResolvedValueOnce('0x13882'); // eth_chainId

      const account = await web3Provider.connectWallet();

      expect(account).toBe(mockAccounts[0]);
      expect(web3Provider.account).toBe(mockAccounts[0]);
      expect(web3Provider.isConnected).toBe(true);
      expect(mockEthereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockEthereum.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
    });

    it('should throw error when MetaMask is not installed', async () => {
      delete global.window.ethereum;

      await expect(web3Provider.connectWallet()).rejects.toThrow('MetaMask is not installed');
    });

    it('should throw error when no accounts found', async () => {
      mockEthereum.request.mockResolvedValueOnce([]); // empty accounts array

      await expect(web3Provider.connectWallet()).rejects.toThrow('No accounts found');
    });

    it('should throw error when on wrong network', async () => {
      const mockAccounts = ['0x1234567890123456789012345678901234567890'];
      mockEthereum.request
        .mockResolvedValueOnce(mockAccounts) // eth_requestAccounts
        .mockResolvedValueOnce('0x1'); // wrong chain ID

      await expect(web3Provider.connectWallet()).rejects.toThrow('Wrong network');
    });
  });

  describe('disconnectWallet', () => {
    it('should disconnect wallet and clean up', async () => {
      // Set up connected state
      web3Provider.account = '0x1234567890123456789012345678901234567890';
      web3Provider.isConnected = true;

      await web3Provider.disconnectWallet();

      expect(web3Provider.account).toBe(null);
      expect(web3Provider.isConnected).toBe(false);
      expect(mockEthereum.removeListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateNetwork', () => {
    it('should validate correct network', async () => {
      mockEthereum.request.mockResolvedValueOnce('0x13882'); // correct chain ID

      const result = await web3Provider.validateNetwork();
      expect(result).toBe(true);
    });

    it('should throw error for wrong network', async () => {
      mockEthereum.request.mockResolvedValueOnce('0x1'); // wrong chain ID

      await expect(web3Provider.validateNetwork()).rejects.toThrow('Wrong network');
    });
  });

  describe('switchToPolygonAmoy', () => {
    it('should switch to Polygon Amoy network', async () => {
      mockEthereum.request.mockResolvedValueOnce(null); // successful switch

      const result = await web3Provider.switchToPolygonAmoy();
      expect(result).toBe(true);
      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }],
      });
    });

    it('should add network if it does not exist', async () => {
      const switchError = { code: 4902 };
      mockEthereum.request
        .mockRejectedValueOnce(switchError) // switch fails
        .mockResolvedValueOnce(null); // add succeeds

      const result = await web3Provider.switchToPolygonAmoy();
      expect(result).toBe(true);
      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'wallet_addEthereumChain',
        params: [expect.objectContaining({
          chainId: '0x13882',
          chainName: 'Polygon Amoy Testnet',
        })],
      });
    });

    it('should throw error when MetaMask is not installed', async () => {
      delete global.window.ethereum;

      await expect(web3Provider.switchToPolygonAmoy()).rejects.toThrow('MetaMask is not installed');
    });
  });

  describe('contract interactions', () => {
    beforeEach(async () => {
      await web3Provider.initialize();
      
      // Mock contract methods
      web3Provider.contract = {
        methods: {
          getCount: jest.fn(() => ({
            call: jest.fn().mockResolvedValue('42'),
          })),
          increment: jest.fn(() => ({
            estimateGas: jest.fn().mockResolvedValue(50000),
            send: jest.fn().mockResolvedValue({ transactionHash: '0xabc123' }),
          })),
        },
      };
    });

    describe('getCounterValue', () => {
      it('should get counter value successfully', async () => {
        const value = await web3Provider.getCounterValue();
        expect(value).toBe(42);
      });

      it('should throw error when contract not initialized', async () => {
        web3Provider.contract = null;
        await expect(web3Provider.getCounterValue()).rejects.toThrow('Contract not initialized');
      });
    });

    describe('incrementCounter', () => {
      beforeEach(() => {
        web3Provider.account = '0x1234567890123456789012345678901234567890';
        web3Provider.isConnected = true;
        mockEthereum.request.mockResolvedValue('0x13882'); // correct network
      });

      it('should increment counter successfully', async () => {
        const transaction = await web3Provider.incrementCounter();
        
        expect(transaction).toEqual({ transactionHash: '0xabc123' });
        expect(web3Provider.contract.methods.increment().estimateGas).toHaveBeenCalledWith({
          from: web3Provider.account,
        });
        expect(web3Provider.contract.methods.increment().send).toHaveBeenCalledWith({
          from: web3Provider.account,
          gas: 60000, // 50000 * 1.2
        });
      });

      it('should throw error when wallet not connected', async () => {
        web3Provider.isConnected = false;
        web3Provider.account = null;

        await expect(web3Provider.incrementCounter()).rejects.toThrow('Wallet not connected');
      });

      it('should throw error when contract not initialized', async () => {
        web3Provider.contract = null;
        await expect(web3Provider.incrementCounter()).rejects.toThrow('Contract not initialized');
      });
    });
  });

  describe('utility methods', () => {
    beforeEach(async () => {
      await web3Provider.initialize();
    });

    it('should format address correctly', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const formatted = web3Provider.formatAddress(address);
      expect(formatted).toBe('0x1234...7890');
    });

    it('should return empty string for null address', () => {
      const formatted = web3Provider.formatAddress(null);
      expect(formatted).toBe('');
    });

    it('should generate correct transaction URL', () => {
      const txHash = '0xabc123';
      const url = web3Provider.getTransactionUrl(txHash);
      expect(url).toBe('https://amoy.polygonscan.com/tx/0xabc123');
    });

    it('should generate correct address URL', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const url = web3Provider.getAddressUrl(address);
      expect(url).toBe('https://amoy.polygonscan.com/address/0x1234567890123456789012345678901234567890');
    });
  });
});