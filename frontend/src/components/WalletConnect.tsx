import React from 'react';
import { truncateAddress } from '../utils/errorParser';

interface WalletConnectProps {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletConnect({
  isConnected,
  isConnecting,
  address,
  error,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  return (
    <div className="wallet-connect">
      {!isConnected ? (
        <div className="wallet-connect-section">
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="btn-primary"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="address-display">
            <span className="address-label">Connected:</span>
            <span className="address-value">{truncateAddress(address!)}</span>
          </div>
          <button onClick={onDisconnect} className="btn-secondary">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
