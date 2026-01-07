import React from 'react';
import { NETWORK_NAMES, SUPPORTED_CHAIN_ID } from '../utils/constants';

interface NetworkWarningProps {
  currentChainId: number | null;
  onSwitchNetwork: () => void;
}

export function NetworkWarning({
  currentChainId,
  onSwitchNetwork,
}: NetworkWarningProps) {
  if (currentChainId === SUPPORTED_CHAIN_ID) {
    return null;
  }

  const currentNetwork = currentChainId
    ? NETWORK_NAMES[currentChainId] || `Chain ID: ${currentChainId}`
    : 'Unknown';
  const supportedNetwork = NETWORK_NAMES[SUPPORTED_CHAIN_ID];

  return (
    <div className="network-warning">
      <div className="warning-content">
        <h3>⚠️ Wrong Network</h3>
        <p>
          You're connected to <strong>{currentNetwork}</strong>
        </p>
        <p>
          Please switch to <strong>{supportedNetwork}</strong>
        </p>
        <button onClick={onSwitchNetwork} className="btn-warning">
          Switch Network
        </button>
      </div>
    </div>
  );
}