import { useEffect, useState } from 'react';

export interface CryptoBuyAvailableResult {
  isAvailable: boolean;
}

export const useCryptoBuyAvailable = (
  cryptoCode: string,
  networkMarketName: string
): CryptoBuyAvailableResult => {
  const [isAvailable, setIsAvailable] = useState(false);
  const isFiatOnRampEnabled = process.env.NEXT_PUBLIC_FIAT_ON_RAMP;
  useEffect(() => {
    if (isFiatOnRampEnabled === 'true') {
      (async function () {
        const transakApiUrl = process.env.NEXT_PUBLIC_TRANSAK_API_URL;
        try {
          const response = await fetch(
            `${transakApiUrl}/cryptocoverage/api/v1/public/partner/crypto-currencies?symbol=${cryptoCode}&network=${networkMarketName}`
          );

          setIsAvailable(response.ok);
        } catch (e) {
          setIsAvailable(false);
        }
      })();
    }
  }, [cryptoCode, networkMarketName]);

  return {
    isAvailable,
  };
};
