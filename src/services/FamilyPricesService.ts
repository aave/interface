import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { zeroAddress } from 'viem';

type FamilyPricesResponse = {
  prices: {
    [tokenId: string]: {
      usd: number;
    };
  };
};
export class FamilyPricesService {
  private proxyUrl = '/api/prices-proxy';

  /**
   * Fetches the USD price of a token from the Family API via proxy.
   * @param chainId - The ID of the blockchain network.
   * @param tokenAddress - The address of the token.
   * @returns The USD price of the token.
   */
  async getTokenUsdPrice(chainId: number, tokenAddress: string): Promise<string | undefined> {
    try {
      const apiExpectedAddress =
        tokenAddress.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()
          ? zeroAddress
          : tokenAddress;

      const tokenId = `${chainId}:${apiExpectedAddress}`.toLowerCase();

      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenIds: [tokenId],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch USD price: ${response.statusText}`);
      }

      const data = (await response.json()) as FamilyPricesResponse;

      if (data?.prices && data.prices[tokenId]?.usd !== undefined) {
        return data.prices[tokenId].usd.toString();
      }

      return undefined;
    } catch (error) {
      console.error('Error fetching token USD price:', error);
      return undefined;
    }
  }

  /**
   * Fetches the USD prices of multiple tokens from the Family API via proxy.
   * @param tokenRequests - Array of objects with chainId and tokenAddress.
   * @returns Map of tokenId to USD price.
   */
  async getMultipleTokenUsdPrices(
    tokenRequests: Array<{ chainId: number; tokenAddress: string }>
  ): Promise<Map<string, string>> {
    const priceMap = new Map<string, string>();

    try {
      if (tokenRequests.length === 0) {
        return priceMap;
      }

      const tokenIds = tokenRequests.map(({ chainId, tokenAddress }) => {
        const apiExpectedAddress =
          tokenAddress.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()
            ? zeroAddress
            : tokenAddress;
        return `${chainId}:${apiExpectedAddress}`;
      });

      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch USD prices: ${response.statusText}`);
      }

      const data = (await response.json()) as FamilyPricesResponse;

      if (data?.prices) {
        Object.entries(data.prices).forEach(
          ([tokenId, priceData]: [string, FamilyPricesResponse['prices'][string]]) => {
            if (priceData?.usd !== undefined) {
              priceMap.set(tokenId, priceData.usd.toString());
            }
          }
        );
      }

      return priceMap;
    } catch (error) {
      console.error('Error fetching multiple token USD prices:', error);
      return priceMap;
    }
  }
}
