# WalletConnection Component

A React component that handles MetaMask wallet connection functionality for Web3 applications.

## Features

- **MetaMask Detection**: Automatically detects if MetaMask is installed and shows installation prompts if needed
- **Wallet Connection**: Handles wallet connection with proper error handling for user rejection and other scenarios
- **Network Management**: Displays network status and provides network switching functionality for Polygon Amoy testnet
- **Address Display**: Shows connected wallet address with formatted display and Polygonscan links
- **Error Handling**: Comprehensive error handling for connection failures, network issues, and user rejections
- **Responsive UI**: Clean, modern interface with loading states and visual feedback

## Usage

```jsx
import WalletConnection from './components/WalletConnection';

export default function MyApp() {
  return (
    <div>
      <WalletConnection />
      {/* Other components that depend on wallet connection */}
    </div>
  );
}
```

## Requirements

This component depends on:
- `useWeb3` hook from `../hooks/useWeb3`
- Web3Provider service from `../services/web3Provider`
- Tailwind CSS for styling

## Component States

### 1. MetaMask Not Installed
- Displays installation prompt with link to MetaMask download
- Shows refresh button to check installation status

### 2. Wallet Not Connected
- Shows "Connect Wallet" button
- Displays connection status as "Disconnected"
- Handles loading states during connection

### 3. Wallet Connected
- Shows "Connected" status with green indicator
- Displays formatted wallet address
- Provides link to view address on Polygonscan
- Shows disconnect button

### 4. Wrong Network
- Displays network warning when not on Polygon Amoy testnet
- Provides "Switch Network" button
- Shows expected network name

## Error Handling

The component handles various error scenarios:

- **User Rejection**: Shows user-friendly message when connection is rejected
- **MetaMask Not Installed**: Displays installation instructions
- **No Accounts Found**: Prompts user to unlock wallet
- **Network Switch Rejection**: Provides manual configuration instructions
- **General Errors**: Displays error messages from the Web3 provider

## Testing

The component includes comprehensive unit tests covering:
- MetaMask installation detection
- Wallet connection flow
- Error handling scenarios
- Network switching functionality
- UI state management

Run tests with:
```bash
npm test -- --testPathPatterns=WalletConnection.test.jsx
```

## Implementation Details

### Key Functions

- `handleConnect()`: Manages wallet connection with error handling
- `handleDisconnect()`: Handles wallet disconnection
- `handleNetworkSwitch()`: Manages network switching to Polygon Amoy

### Error States

The component maintains local error state (`connectionError`) that takes precedence over general Web3 errors, providing more specific feedback for connection-related issues.

### Visual Feedback

- Loading spinners during connection/network switching
- Status indicators (connected/disconnected)
- Color-coded network warnings
- Disabled states for buttons during operations

## Requirements Fulfilled

This component fulfills the following requirements from the specification:

- **1.1**: Display "Connect Wallet" button when user visits application
- **1.2**: Prompt MetaMask to connect when user clicks "Connect Wallet"
- **1.3**: Display user's wallet address when successfully connected
- **1.4**: Display appropriate error messages when wallet connection fails
- **1.5**: Display instructions to install MetaMask if not installed

## Integration

The component integrates seamlessly with the existing Web3 infrastructure:
- Uses the `useWeb3` hook for state management
- Leverages the Web3Provider service for blockchain interactions
- Follows the established error handling patterns
- Maintains consistency with the overall application design