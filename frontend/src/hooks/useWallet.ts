import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { SUPPORTED_CHAIN_ID } from '../utils/constants';

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    provider: null,
    signer: null,
  });

  /**
   * Initialize provider and check existing connection
   */
  const initializeProvider = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setState(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to use this dApp.',
      }));
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();

        setState({
          address,
          chainId: Number(network.chainId),
          isConnected: true,
          isConnecting: false,
          error: null,
          provider,
          signer,
        });
      } else {
        setState(prev => ({
          ...prev,
          provider,
          isConnecting: false,
        }));
      }
    } catch (err) {
      console.error('Provider initialization error:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to initialize wallet connection',
        isConnecting: false,
      }));
    }
  }, []);

  /**
   * Connect wallet - Request account access
   */
  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setState(prev => ({
        ...prev,
        error: 'MetaMask is not installed',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setState({
        address,
        chainId: Number(network.chainId),
        isConnected: true,
        isConnecting: false,
        error: null,
        provider,
        signer,
      });
    } catch (err: any) {
      console.error('Connection error:', err);
      let errorMessage = 'Failed to connect wallet';

      if (err.code === 4001) {
        errorMessage = 'Connection request rejected';
      } else if (err.code === -32002) {
        errorMessage = 'Connection request already pending. Please check MetaMask.';
      }

      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, []);

  /**
   * Disconnect wallet - Clear state
   */
  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      provider: null,
      signer: null,
    });
  }, []);

  /**
   * Switch to correct network
   */
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SUPPORTED_CHAIN_ID.toString(16)}` }],
      });
    } catch (err: any) {
      console.error('Network switch error:', err);
      
      if (err.code === 4902) {
        setState(prev => ({
          ...prev,
          error: 'Please add the network to MetaMask manually',
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: 'Failed to switch network',
        }));
      }
    }
  }, []);

  /**
   * Handle account changes
   */
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        initializeProvider();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect, initializeProvider]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    initializeProvider();
  }, [initializeProvider]);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    isCorrectNetwork: state.chainId === SUPPORTED_CHAIN_ID,
  };
}
