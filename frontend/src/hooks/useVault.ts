import { useState, useEffect, useCallback } from 'react';
import { Contract, parseEther, formatEther } from 'ethers';
import { parseError } from '../utils/errorParser';

interface VaultState {
  userBalance: string;
  totalDeposits: string;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
}

interface TransactionState {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash: string | null;
  error: string | null;
}

export function useVault(contract: Contract | null, userAddress: string | null) {
  const [state, setState] = useState<VaultState>({
    userBalance: '0',
    totalDeposits: '0',
    isPaused: false,
    isLoading: false,
    error: null,
  });

  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
    hash: null,
    error: null,
  });

  /**
   * Load vault data from contract
   */
  const loadVaultData = useCallback(async () => {
    if (!contract || !userAddress) {
      setState(prev => ({
        ...prev,
        userBalance: '0',
        totalDeposits: '0',
        isLoading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [balance, total, paused] = await Promise.all([
        contract.getBalance(userAddress),
        contract.totalDeposits(),
        contract.isPaused(),
      ]);

      setState({
        userBalance: formatEther(balance),
        totalDeposits: formatEther(total),
        isPaused: paused,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Failed to load vault data:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load vault data',
      }));
    }
  }, [contract, userAddress]);

  /**
   * Deposit ETH into vault
   */
  const deposit = useCallback(
    async (amount: string) => {
      if (!contract) {
        setTxState({
          status: 'error',
          hash: null,
          error: 'Contract not initialized',
        });
        return;
      }

      setTxState({ status: 'pending', hash: null, error: null });

      try {
        const value = parseEther(amount);
        const tx = await contract.deposit({ value });

        setTxState(prev => ({ ...prev, hash: tx.hash }));

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          setTxState({ status: 'success', hash: tx.hash, error: null });
          await loadVaultData();
        } else {
          setTxState({
            status: 'error',
            hash: tx.hash,
            error: 'Transaction failed',
          });
        }
      } catch (err: any) {
        console.error('Deposit error:', err);
        const errorMessage = parseError(err);
        setTxState({ status: 'error', hash: null, error: errorMessage });
      }
    },
    [contract, loadVaultData]
  );

  /**
   * Withdraw ETH from vault
   */
  const withdraw = useCallback(
    async (amount: string) => {
      if (!contract) {
        setTxState({
          status: 'error',
          hash: null,
          error: 'Contract not initialized',
        });
        return;
      }

      setTxState({ status: 'pending', hash: null, error: null });

      try {
        const value = parseEther(amount);
        const tx = await contract.withdraw(value);

        setTxState(prev => ({ ...prev, hash: tx.hash }));

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          setTxState({ status: 'success', hash: tx.hash, error: null });
          await loadVaultData();
        } else {
          setTxState({
            status: 'error',
            hash: tx.hash,
            error: 'Transaction failed',
          });
        }
      } catch (err: any) {
        console.error('Withdraw error:', err);
        const errorMessage = parseError(err);
        setTxState({ status: 'error', hash: null, error: errorMessage });
      }
    },
    [contract, loadVaultData]
  );

  /**
   * Emergency withdraw all funds
   */
  const emergencyWithdraw = useCallback(async () => {
    if (!contract) {
      setTxState({
        status: 'error',
        hash: null,
        error: 'Contract not initialized',
      });
      return;
    }

    setTxState({ status: 'pending', hash: null, error: null });

    try {
      const tx = await contract.emergencyWithdraw();
      setTxState(prev => ({ ...prev, hash: tx.hash }));

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setTxState({ status: 'success', hash: tx.hash, error: null });
        await loadVaultData();
      } else {
        setTxState({
          status: 'error',
          hash: tx.hash,
          error: 'Transaction failed',
        });
      }
    } catch (err: any) {
      console.error('Emergency withdraw error:', err);
      const errorMessage = parseError(err);
      setTxState({ status: 'error', hash: null, error: errorMessage });
    }
  }, [contract, loadVaultData]);

  /**
   * Reset transaction state
   */
  const resetTxState = useCallback(() => {
    setTxState({ status: 'idle', hash: null, error: null });
  }, []);

  /**
   * Load data on mount and when contract/address changes
   */
  useEffect(() => {
    loadVaultData();
  }, [loadVaultData]);

  /**
   * Listen for contract events
   */
  useEffect(() => {
    if (!contract || !userAddress) return;

    const handleDeposit = (user: string) => {
      if (user.toLowerCase() === userAddress.toLowerCase()) {
        loadVaultData();
      }
    };

    const handleWithdraw = (user: string) => {
      if (user.toLowerCase() === userAddress.toLowerCase()) {
        loadVaultData();
      }
    };

    contract.on('Deposited', handleDeposit);
    contract.on('Withdrawn', handleWithdraw);

    return () => {
      contract.off('Deposited', handleDeposit);
      contract.off('Withdrawn', handleWithdraw);
    };
  }, [contract, userAddress, loadVaultData]);

  return {
    ...state,
    deposit,
    withdraw,
    emergencyWithdraw,
    refresh: loadVaultData,
    txState,
    resetTxState,
  };
}
