import React from 'react';
import { BLOCK_EXPLORER_URLS, SUPPORTED_CHAIN_ID } from '../utils/constants';

interface TransactionStatusProps {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash: string | null;
  error: string | null;
  onDismiss: () => void;
}

export function TransactionStatus({
  status,
  hash,
  error,
  onDismiss,
}: TransactionStatusProps) {
  if (status === 'idle') {
    return null;
  }

  const explorerUrl = BLOCK_EXPLORER_URLS[SUPPORTED_CHAIN_ID];
  const txUrl = hash && explorerUrl ? `${explorerUrl}/tx/${hash}` : null;

  return (
    <div className={`tx-status tx-status-${status}`}>
      <div className="tx-status-content">
        {status === 'pending' && (
          <>
            <div className="spinner"></div>
            <h3>Transaction Pending</h3>
            <p>Please wait for confirmation...</p>
            {txUrl && (
              <a
                href={txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                View on Explorer →
              </a>
            )}
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h3>Transaction Successful</h3>
            <p>Your transaction has been confirmed</p>
            {txUrl && (
              <a
                href={txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                View on Explorer →
              </a>
            )}
            <button onClick={onDismiss} className="btn-secondary">
              Close
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="error-icon">✕</div>
            <h3>Transaction Failed</h3>
            <p className="error-message">{error}</p>
            <button onClick={onDismiss} className="btn-secondary">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}