import { useMemo } from 'react';
import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import TokenVaultABI from '../abi/TokenVault.json';
import { CONTRACT_ADDRESS } from '../utils/constants';

interface UseContractReturn {
  contract: Contract | null;
  contractAddress: string;
}

export function useContract(
  provider: BrowserProvider | null,
  signer: JsonRpcSigner | null
): UseContractReturn {
  const contract = useMemo(() => {
    if (!signer || !CONTRACT_ADDRESS) {
      return null;
    }

    try {
      const parsedABI = typeof TokenVaultABI.abi === 'string' 
        ? JSON.parse(TokenVaultABI.abi) 
        : TokenVaultABI.abi;

      return new Contract(CONTRACT_ADDRESS, parsedABI, signer);
    } catch (err) {
      console.error('Failed to initialize contract:', err);
      return null;
    }
  }, [signer]);

  return {
    contract,
    contractAddress: CONTRACT_ADDRESS,
  };
}
