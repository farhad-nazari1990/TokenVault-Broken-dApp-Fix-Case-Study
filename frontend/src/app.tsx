import React from 'react';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';
import { useVault } from './hooks/useVault';
import { WalletConnect } from './components/WalletConnect';
import { NetworkWarning } from './components/NetworkWarning';
import { VaultInterface } from './components/VaultInterface';
import { TransactionStatus } from './components/TransactionStatus';
import './index.css';

function App() {
  const {
    address,
    chainId,
    isConnected,
    isConnecting,
    error: walletError,
    provider,
    signer,
    connect,
    disconnect,
    switchNetwork,
    isCorrectNetwork,
  } = useWallet();

  const { contract } = useContract(provider, signer);

  const {
    userBalance,
    totalDeposits,
    isPaused,
    isLoading,
    error: vaultError,
    deposit,
    withdraw,
    emergencyWithdraw,
    refresh,
    txState,
    resetTxState,
  } = useVault(contract, address);

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>🏦 TokenVault</h1>
          <p className="subtitle">Secure ETH Vault - Fixed & Production-Ready</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Wallet Connection */}
          <div className="card">
            <WalletConnect
              isConnected={isConnected}
              isConnecting={isConnecting}
              address={address}
              error={walletError}
              onConnect={connect}
              onDisconnect={disconnect}
            />
          </div>

          {/* Network Warning */}
          {isConnected && !isCorrectNetwork && (
            <NetworkWarning
              currentChainId={chainId}
              onSwitchNetwork={switchNetwork}
            />
          )}

          {/* Vault Interface */}
          {isConnected && isCorrectNetwork && (
            <>
              <div className="card">
                <VaultInterface
                  userBalance={userBalance}
                  totalDeposits={totalDeposits}
                  isPaused={isPaused}
                  isLoading={isLoading}
                  txPending={txState.status === 'pending'}
                  onDeposit={deposit}
                  onWithdraw={withdraw}
                  onEmergencyWithdraw={emergencyWithdraw}
                  onRefresh={refresh}
                />
              </div>

              {vaultError && (
                <div className="error-banner">
                  <p>{vaultError}</p>
                </div>
              )}
            </>
          )}

          {/* Transaction Status Modal */}
          <TransactionStatus
            status={txState.status}
            hash={txState.hash}
            error={txState.error}
            onDismiss={resetTxState}
          />
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>
            Built with React + TypeScript + Ethers.js v6
          </p>
          <p className="footer-note">
            ✅ Fixed: Wallet connection • Transaction handling • Error messages • State sync
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;