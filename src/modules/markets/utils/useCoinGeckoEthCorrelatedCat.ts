import { useEffect, useState } from 'react';

import { ETH_CORRELATED_SYMBOLS_FALLBACK } from './assetCategories';

const CG_ENDPOINT = 'https://pro-api.coingecko.com/api/v3/coins/markets';
const HEADERS: HeadersInit = {
  accept: 'application/json',
  'x-cg-pro-api-key': process.env.NEXT_PUBLIC_CG_API_KEY ?? '',
};
interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
}
export function useCoinGeckoEthCorrelatedCat() {
  const [ethCorrelatedSymbols, setEthCorrelatedSymbols] = useState<string[]>(
    ETH_CORRELATED_SYMBOLS_FALLBACK
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadEthCorrelatedCoins = async () => {
      setLoading(true);
      setError(null);

      try {
        const [response1, response2, response3] = await Promise.all([
          fetch(`${CG_ENDPOINT}?vs_currency=usd&category=liquid-staked-eth&per_page=250&page=1`, {
            method: 'GET',
            headers: HEADERS,
          }),
          fetch(`${CG_ENDPOINT}?vs_currency=usd&category=ether-fi-ecosystem&per_page=250&page=1`, {
            method: 'GET',
            headers: HEADERS,
          }),
          fetch(
            `${CG_ENDPOINT}?vs_currency=usd&category=liquid-staking-tokens&per_page=250&page=1`,
            {
              method: 'GET',
              headers: HEADERS,
            }
          ),
        ]);

        if (!response1.ok) {
          throw new Error(`Error fetching liquid-staked-eth: ${response1.statusText}`);
        }
        if (!response2.ok) {
          throw new Error(`Error fetching ether-fi-ecosystem: ${response2.statusText}`);
        }
        if (!response3.ok) {
          throw new Error(`Error fetching liquid-staking-tokens: ${response3.statusText}`);
        }

        const [data1, data2, data3] = await Promise.all([
          response1.json(),
          response2.json(),
          response3.json(),
        ]);
        // Filter category 'liquid-staking-tokens' to only include coins correlated to ETH
        const filteredData3 = data3.filter((coin: CoinGeckoCoin) => {
          const symbol = coin.symbol?.toUpperCase();
          return symbol?.includes('ETH');
        });

        const combinedData = [...data1, ...data2, ...filteredData3];

        const symbols = combinedData
          .map((coin: CoinGeckoCoin) => coin.symbol?.toUpperCase())
          .filter((symbol: string) => symbol);

        const uniqueSymbols = [...new Set([...symbols, 'WETH'])];
        setEthCorrelatedSymbols(uniqueSymbols);
      } catch (err) {
        setError(err as Error);
        console.error('Error loading Eth Correlated from CoinGecko, using fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEthCorrelatedCoins();
  }, []);

  return { ethCorrelatedSymbols, loading, error };
}
