import { ChainId } from '@aave/contract-helpers';
import { useEffect, useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useProtocolDataContext } from './useProtocolDataContext';

export interface AddressAllowedResult {
  isAllowed: boolean;
  isLoading: boolean;
}

export const useAddressAllowed = (): AddressAllowedResult => {
  const { currentChainId: chainId } = useProtocolDataContext();
  const { currentAccount: walletAddress } = useWeb3Context();

  const [isAllowed, setIsAllowed] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getIsAddressAllowed = async () => {
      try {
        setIsLoading(true);
        // TODO: pull url from the config
        const response = await fetch(
          `https://api-v2-feat-readd-wallet-screen-endpoint.aaw.fi/addresses/status?address=${walletAddress}`
        );
        const data: { addressAllowed: boolean } = await response.json();
        setIsAllowed(data.addressAllowed);
        setIsLoading(false);
      } catch (e) {
        setIsLoading(false);
      }
    };

    if (walletAddress && chainId === ChainId.mainnet) {
      getIsAddressAllowed();
    } else {
      setIsAllowed(true);
      setIsLoading(false);
    }
  }, [chainId, walletAddress]);

  return {
    isAllowed,
    isLoading,
  };
};
