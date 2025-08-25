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

export async function fetchCoinGeckoStablecoins() {
  const [response1, response2] = await Promise.all([
    fetch(`${CG_ENDPOINT}?vs_currency=usd&category=stablecoins&per_page=250&page=1`, {
      method: 'GET',
      headers: HEADERS,
    }),
    fetch(`${CG_ENDPOINT}?vs_currency=usd&category=stablecoins&per_page=250&page=2`, {
      method: 'GET',
      headers: HEADERS,
    }),
  ]);

  if (!response1.ok) {
    throw new Error(`Error fetching stablecoins page 1: ${response1.statusText}`);
  }
  if (!response2.ok) {
    throw new Error(`Error fetching stablecoins page 2: ${response2.statusText}`);
  }

  const [data1, data2] = await Promise.all([response1.json(), response2.json()]);

  const combinedData = [...data1, ...data2];

  const symbols = combinedData
    .map((coin: CoinGeckoCoin) => coin.symbol?.toUpperCase())
    .filter((symbol: string) => symbol);

  const uniqueSymbols = [...new Set(symbols)];

  //console.log('Stablecoin symbols fetched from CoinGecko:', uniqueSymbols);

  return uniqueSymbols;
}
