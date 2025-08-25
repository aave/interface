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
export async function fetchCoinGeckoEthCorrelated(): Promise<string[]> {
  // Fetch ambas categorías en paralelo
  const [response1, response2] = await Promise.all([
    fetch(`${CG_ENDPOINT}?vs_currency=usd&category=liquid-staked-eth&per_page=250&page=1`, {
      method: 'GET',
      headers: HEADERS,
    }),
    fetch(`${CG_ENDPOINT}?vs_currency=usd&category=ether-fi-ecosystem&per_page=250&page=1`, {
      method: 'GET',
      headers: HEADERS,
    }),
  ]);

  // Verificar que ambas respuestas sean exitosas
  if (!response1.ok) {
    throw new Error(`Error fetching liquid-staked-eth: ${response1.statusText}`);
  }
  if (!response2.ok) {
    throw new Error(`Error fetching ether-fi-ecosystem: ${response2.statusText}`);
  }

  // Obtener datos de ambas respuestas
  const [data1, data2] = await Promise.all([response1.json(), response2.json()]);

  // Combinar ambos arrays de datos
  const combinedData = [...data1, ...data2];

  // Procesar símbolos y eliminar duplicados
  const symbols = combinedData
    .map((coin: CoinGeckoCoin) => coin.symbol?.toUpperCase())
    .filter((symbol: string) => symbol);

  // Eliminar duplicados con Set
  const uniqueSymbols = [...new Set([...symbols, 'WETH'])];

  // console.log('ETH Correlated Symbols:', uniqueSymbols);

  return uniqueSymbols;
}
