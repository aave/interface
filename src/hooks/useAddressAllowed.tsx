import { ChainId } from '@aave/contract-helpers';
import { useEffect, useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useProtocolDataContext } from './useProtocolDataContext';

export interface AddressAllowedResult {
  isAllowed: boolean;
  loading: boolean;
}

export const useAddressAllowed = (): AddressAllowedResult => {
  const { currentChainId: chainId } = useProtocolDataContext();
  const { currentAccount: walletAddress } = useWeb3Context();

  const [isAllowed, setIsAllowed] = useState(true);
  const [loading, setLoading] = useState(true);

  const screeningUrl = process.env.NEXT_PUBLIC_SCREENING_URL;

  useEffect(() => {
    const getIsAddressAllowed = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${screeningUrl}/addresses/status?address=${walletAddress}`);
        const data: { addressAllowed: boolean } = await response.json();
        setIsAllowed(data.addressAllowed);
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };

    if (screeningUrl && walletAddress && chainId === ChainId.mainnet) {
      getIsAddressAllowed();
    } else {
      setIsAllowed(true);
      setLoading(false);
    }
  }, [chainId, screeningUrl, walletAddress]);

  return {
    isAllowed,
    loading,
  };
};
