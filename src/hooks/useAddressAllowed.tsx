import { useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { usePolling } from './usePolling';

export interface AddressAllowedResult {
  isAllowed: boolean;
}

const TWO_MINUTES = 2 * 60 * 1000;

export const useAddressAllowed = (): AddressAllowedResult => {
  const { currentAccount: walletAddress } = useWeb3Context();

  const [isAllowed, setIsAllowed] = useState(true);

  const screeningUrl = process.env.NEXT_PUBLIC_SCREENING_URL;

  const getIsAddressAllowed = async () => {
    if (screeningUrl && walletAddress) {
      try {
        const response = await fetch(`${'screeningUrl'}/addresses/status?address=${walletAddress}`);
        const data: { addressAllowed: boolean } = await response.json();
        setIsAllowed(data.addressAllowed);
      } catch (e) {}
    } else {
      setIsAllowed(true);
    }
  };

  usePolling(getIsAddressAllowed, TWO_MINUTES, !walletAddress, [walletAddress]);

  return {
    isAllowed,
  };
};
