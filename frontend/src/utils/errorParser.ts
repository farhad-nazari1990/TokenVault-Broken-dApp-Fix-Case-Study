/**
 * Parse Web3 errors into user-friendly messages
 * Handles common MetaMask, network, and contract errors
 */
export function parseError(error: any): string {
  // User rejected transaction
  if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
    return 'Transaction was rejected';
  }

  // Insufficient funds
  if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
    return 'Insufficient funds to complete transaction';
  }

  // Network errors
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your connection';
  }

  // Contract revert errors
  if (error.message?.includes('InsufficientDeposit')) {
    return 'Deposit amount is below minimum (0.001 ETH)';
  }

  if (error.message?.includes('ExcessiveDeposit')) {
    return 'Deposit amount exceeds maximum (10 ETH)';
  }

  if (error.message?.includes('InsufficientBalance')) {
    return 'Insufficient balance in vault';
  }

  if (error.message?.includes('ContractPaused')) {
    return 'Contract is currently paused';
  }

  if (error.message?.includes('ZeroAmount')) {
    return 'Amount must be greater than zero';
  }

  if (error.message?.includes('TransferFailed')) {
    return 'Transfer failed. Please try again';
  }

  // Gas estimation errors
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Transaction would fail. Please check your inputs';
  }

  // Timeout errors
  if (error.code === 'TIMEOUT') {
    return 'Transaction timeout. Please check on block explorer';
  }

  // Nonce errors
  if (error.message?.includes('nonce')) {
    return 'Transaction nonce conflict. Please try again';
  }

  // Generic contract revert
  if (error.code === 'CALL_EXCEPTION') {
    return 'Transaction would fail. Please check contract conditions';
  }

  // Default fallback
  console.error('Unhandled error:', error);
  return error.message || 'An unexpected error occurred';
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format ETH amount for display
 */
export function formatEthDisplay(value: string): string {
  const num = parseFloat(value);
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  if (num < 1) return num.toFixed(4);
  return num.toFixed(4);
}
