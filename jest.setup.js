import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'

// Mock window.ethereum for tests
global.window = global.window || {}
global.window.ethereum = {
  isMetaMask: true,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
}