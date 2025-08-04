import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CounterDisplay from '../CounterDisplay';
import { useWeb3 } from '../../hooks/useWeb3';

// Mock the useWeb3 hook
jest.mock('../../hooks/useWeb3');

describe('CounterDisplay', () => {
  const mockUseWeb3 = {
    counterValue: 0,
    refreshCounterValue: jest.fn(),
    isInitialized: true,
    isConnected: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useWeb3.mockReturnValue(mockUseWeb3);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Rendering', () => {
    it('should render the component with counter value', async () => {
      const mockRefresh = jest.fn().mockResolvedValue();
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
      });

      render(<CounterDisplay />);
      
      expect(screen.getByText('Current Counter Value')).toBeInTheDocument();
      
      // Wait for the loading to complete
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('Total increments on the blockchain')).toBeInTheDocument();
      });
    });

    it('should show loading skeleton when not initialized', () => {
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        isInitialized: false,
      });

      render(<CounterDisplay />);
      
      // Should show loading skeleton (animated pulse divs)
      const pulseElements = document.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });

    it('should display the correct counter value', async () => {
      const mockRefresh = jest.fn().mockResolvedValue();
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        counterValue: 42,
        refreshCounterValue: mockRefresh,
      });

      render(<CounterDisplay />);
      
      // Wait for the loading to complete
      await waitFor(() => {
        expect(screen.getByText('42')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner during refresh', async () => {
      const mockRefresh = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
      });

      render(<CounterDisplay />);
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
    });

    it('should disable refresh button during loading', async () => {
      const mockRefresh = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
      });

      render(<CounterDisplay />);
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      expect(refreshButton).toBeDisabled();
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when refresh fails', async () => {
      const mockRefresh = jest.fn().mockRejectedValue(new Error('Network error'));
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
      });

      render(<CounterDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch counter value. Please try again.')).toBeInTheDocument();
      });
    });

    it('should show try again button when error occurs', async () => {
      const mockRefresh = jest.fn().mockRejectedValue(new Error('Network error'));
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
      });

      render(<CounterDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('should retry refresh when try again button is clicked', async () => {
      const mockRefresh = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce();
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
      });

      render(<CounterDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalledTimes(2);
      });
    });

    it('should clear error when refresh succeeds', async () => {
      const mockRefresh = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce();
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
      });

      render(<CounterDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch counter value. Please try again.')).toBeInTheDocument();
      });

      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);

      await waitFor(() => {
        expect(screen.queryByText('Failed to fetch counter value. Please try again.')).not.toBeInTheDocument();
      });
    });
  });

  describe('Automatic Refresh', () => {
    it('should refresh counter value on component mount', () => {
      const mockRefresh = jest.fn();
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
      });

      render(<CounterDisplay />);
      
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should refresh when wallet connects', async () => {
      const mockRefresh = jest.fn().mockResolvedValue();
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
        isConnected: false,
      });

      const { rerender } = render(<CounterDisplay />);
      
      // Clear the initial call
      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
      mockRefresh.mockClear();
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
        isConnected: true,
      });

      rerender(<CounterDisplay />);
      
      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalledTimes(1); // Called when connection changes
      });
    });

    it('should auto-refresh every 30 seconds when connected', () => {
      const mockRefresh = jest.fn();
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
        isConnected: true,
      });

      render(<CounterDisplay />);
      
      // Clear the initial call
      mockRefresh.mockClear();
      
      // Advance time by 30 seconds
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(mockRefresh).toHaveBeenCalledTimes(1);
      
      // Advance another 30 seconds
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(mockRefresh).toHaveBeenCalledTimes(2);
    });

    it('should not auto-refresh when disconnected', () => {
      const mockRefresh = jest.fn();
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
        isConnected: false,
      });

      render(<CounterDisplay />);
      
      // Clear the initial call
      mockRefresh.mockClear();
      
      // Advance time by 30 seconds
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  describe('Manual Refresh', () => {
    it('should refresh when refresh button is clicked', async () => {
      const mockRefresh = jest.fn().mockResolvedValue();
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
      });

      render(<CounterDisplay />);
      
      // Wait for initial render to complete and button to be enabled
      await waitFor(() => {
        const refreshButton = screen.getByText('Refresh');
        expect(refreshButton).not.toBeDisabled();
      });
      
      // Clear the initial call
      mockRefresh.mockClear();
      
      const refreshButton = screen.getByText('Refresh');
      
      await act(async () => {
        fireEvent.click(refreshButton);
      });

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should update last refresh time after successful refresh', async () => {
      const mockRefresh = jest.fn().mockResolvedValue();
      
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
      });

      render(<CounterDisplay />);
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
      });
    });
  });

  describe('Wallet Connection Status', () => {
    it('should show connection prompt when wallet is not connected', () => {
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        isConnected: false,
      });

      render(<CounterDisplay />);
      
      expect(screen.getByText('Connect your wallet to see real-time updates')).toBeInTheDocument();
    });

    it('should not show connection prompt when wallet is connected', () => {
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        isConnected: true,
      });

      render(<CounterDisplay />);
      
      expect(screen.queryByText('Connect your wallet to see real-time updates')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<CounterDisplay />);
      
      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).toHaveAttribute('type', 'button');
    });

    it('should handle keyboard navigation', async () => {
      const mockRefresh = jest.fn().mockResolvedValue();
      useWeb3.mockReturnValue({
        ...mockUseWeb3,
        refreshCounterValue: mockRefresh,
      });

      render(<CounterDisplay />);
      
      // Wait for component to finish loading and button to be enabled
      await waitFor(() => {
        const refreshButton = screen.getByText('Refresh');
        expect(refreshButton).not.toBeDisabled();
      });
      
      const refreshButton = screen.getByText('Refresh');
      refreshButton.focus();
      expect(refreshButton).toHaveFocus();
    });
  });
});