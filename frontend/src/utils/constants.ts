/**
 * Application constants
 */

// Contract address from deployment
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

// Supported chain ID (Sepolia = 11155111, Goerli = 5)
export const SUPPORTED_CHAIN_ID = parseInt(
  import.meta.env.VITE_CHAIN_ID || '11155111'
);

// Network names
export const NETWORK_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  5: 'Goerli Testnet',
  11155111: 'Sepolia Testnet',
  1337: 'Localhost',
};

// Block explorer URLs
export const BLOCK_EXPLORER_URLS: Record<number, string> = {
  1: 'https://etherscan.io',
  5: 'https://goerli.etherscan.io',
  11155111: 'https://sepolia.etherscan.io',
};

// Vault limits
export const MIN_DEPOSIT = '0.001';
export const MAX_DEPOSIT = '10';

// Transaction confirmation blocks
export const CONFIRMATION_BLOCKS = 1;
