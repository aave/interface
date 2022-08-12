import { useState } from 'react';
import { usePolling } from './usePolling';

export interface AddressAllowedResult {
  isAllowed: boolean;
}

const TWO_MINUTES = 2 * 60 * 1000;

export const useAddressAllowed = (address: string): AddressAllowedResult => {
  const [isAllowed, setIsAllowed] = useState(true);

  const screeningUrl = process.env.NEXT_PUBLIC_SCREENING_URL;

  const getIsAddressAllowed = async () => {
    if (screeningUrl && address) {
      try {
        const response = await fetch(`${screeningUrl}/addresses/status?address=${address}`);
        const data: { addressAllowed: boolean } = await response.json();
        setIsAllowed(data.addressAllowed);
      } catch (e) {}
    } else {
      setIsAllowed(true);
    }
  };

  usePolling(getIsAddressAllowed, TWO_MINUTES, false, [address]);

  return {
    isAllowed,
  };
};
