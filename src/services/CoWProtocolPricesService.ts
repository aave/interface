import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';

export class CoWProtocolPricesService {
  private baseUrl = 'https://bff.cow.fi';

  /**
   * Fetches the USD price of a token from the CoW Protocol API.
   * @param chainId - The ID of the blockchain network.
   * @param tokenAddress - The address of the token.
   * @returns The USD price of the token.
   */
  async getTokenUsdPrice(chainId: number, tokenAddress: string): Promise<string | undefined> {
    const endpoint = `/${chainId}/tokens/${tokenAddress}/usdPrice`;

    try {
      if (tokenAddress === API_ETH_MOCK_ADDRESS) {
        throw new Error('Native tokens not supported');
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch USD price: ${response.statusText}`);
      }

      const data = await response.json();

      return data.price;
    } catch (error) {
      console.error('Error fetching token USD price:', error);

      return undefined;
    }
  }
}
