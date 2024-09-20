import { useState } from 'react';

import { usePolling } from './usePolling';

export interface AddressAllowedResult {
  isAllowed: boolean;
}

const TWO_MINUTES = 2 * 60 * 1000;

export const useAddressAllowed = (address: string): AddressAllowedResult => {
  const [isAllowed, setIsAllowed] = useState(true);

  const getIsAddressAllowed = async () => {
    setIsAllowed(true);
  };

  usePolling(getIsAddressAllowed, TWO_MINUTES, false, [address]);

  return {
    isAllowed,
  };
};
