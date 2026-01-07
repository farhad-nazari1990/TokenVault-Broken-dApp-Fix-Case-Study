import React, { useState } from 'react';
import { formatEthDisplay } from '../utils/errorParser';
import { MIN_DEPOSIT, MAX_DEPOSIT } from '../utils/constants';

interface VaultInterfaceProps {
  userBalance: string;
  totalDeposits: string;
  isPaused: boolean;
  isLoading: boolean;
  txPending: boolean;
  onDeposit: (amount: string) => void;
  onWithdraw: (amount: string) => void;
  onEmergencyWithdraw: () => void;
  onRefresh: () => void;
}

export function VaultInterface({
  userBalance,
  totalDeposits,
  isPaused,
  isLoading,
  txPending,
  onDeposit,
  onWithdraw,
  onEmergencyWithdraw,
  onRefresh,
}: VaultInterfaceProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    onDeposit(depositAmount);
    setDepositAmount('');
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    onWithdraw(withdrawAmount);
    setWithdrawAmount('');
  };

  const handleEmergencyWithdraw = () => {
    onEmergencyWithdraw();
    setShowEmergencyConfirm(false);
  };

  const canDeposit = !isPaused && !txPending && depositAmount && parseFloat(depositAmount) > 0;
  const canWithdraw = !isPaused && !txPending && withdrawAmount && parseFloat(withdrawAmount) > 0;
  const hasBalance = parseFloat(userBalance) > 0;

  return (
    <div className="vault-interface">
      {/* Status Section */}
      <div className="vault-status">
        <h2>Vault Status</h2>
        
        {isPaused && (
          <div className="pause-warning">
            ⚠️ Vault is currently paused
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Your Balance</span>
            <span className="stat-value">{formatEthDisplay(userBalance)} ETH</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Deposits</span>
            <span className="stat-value">{formatEthDisplay(totalDeposits)} ETH</span>
          </div>
        </div>

        <button 
          onClick={onRefresh} 
          disabled={isLoading}
          className="btn-refresh"
        >
          {isLoading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      {/* Deposit Section */}
      <div className="action-section">
        <h3>Deposit</h3>
        <p className="action-description">
          Deposit ETH into the vault (Min: {MIN_DEPOSIT} ETH, Max: {MAX_DEPOSIT} ETH)
        </p>
        <div className="input-group">
          <input
            type="number"
            placeholder="Amount in ETH"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            disabled={txPending || isPaused}
            step="0.001"
            min={MIN_DEPOSIT}
            max={MAX_DEPOSIT}
          />
          <button
            onClick={handleDeposit}
            disabled={!canDeposit}
            className="btn-primary"
          >
            {txPending ? 'Processing...' : 'Deposit'}
          </button>
        </div>
      </div>

      {/* Withdraw Section */}
      <div className="action-section">
        <h3>Withdraw</h3>
        <p className="action-description">
          Withdraw your ETH from the vault
        </p>
        <div className="input-group">
          <input
            type="number"
            placeholder="Amount in ETH"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            disabled={txPending || isPaused}
            step="0.001"
            min="0"
            max={userBalance}
          />
          <button
            onClick={handleWithdraw}
            disabled={!canWithdraw}
            className="btn-primary"
          >
            {txPending ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
        {hasBalance && (
          <button
            onClick={() => setWithdrawAmount(userBalance)}
            className="btn-text"
            disabled={txPending}
          >
            Max: {formatEthDisplay(userBalance)} ETH
          </button>
        )}
      </div>

      {/* Emergency Withdraw */}
      {hasBalance && (
        <div className="emergency-section">
          {!showEmergencyConfirm ? (
            <button
              onClick={() => setShowEmergencyConfirm(true)}
              disabled={txPending}
              className="btn-danger"
            >
              Emergency Withdraw All
            </button>
          ) : (
            <div className="confirm-emergency">
              <p>Are you sure you want to withdraw all funds?</p>
              <div className="confirm-buttons">
                <button
                  onClick={handleEmergencyWithdraw}
                  disabled={txPending}
                  className="btn-danger"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowEmergencyConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
