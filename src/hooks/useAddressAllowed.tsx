import { useState } from 'react';

import { usePolling } from './usePolling';

export interface AddressAllowedResult {
  isAllowed: boolean;
  message?: string;
}

const TWO_MINUTES = 2 * 60 * 1000;

export const useAddressAllowed = (address: string): AddressAllowedResult => {
  const [isAllowed, setIsAllowed] = useState(true);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const screeningUrl = `${process.env.NEXT_PUBLIC_API_BASEURL}/addresses/status`;
  const queryParams = `?address=${address}`;

  const getIsAddressAllowed = async () => {
    if (screeningUrl && address) {
      try {
        const response = await fetch(screeningUrl + queryParams);
        if (response.ok) {
          const data: { addressAllowed: boolean; message?: string } = await response.json();
          setIsAllowed(data.addressAllowed);
          setMessage(data.message);
        }
      } catch (e) {}
    } else {
      setIsAllowed(true);
    }
  };

  usePolling(getIsAddressAllowed, TWO_MINUTES, false, [address]);

  return {
    isAllowed,
    message,
  };
};
