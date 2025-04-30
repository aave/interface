import { Network } from '@ethersproject/networks';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

/**
 * A JsonRpcProvider that routes requests through the server to keep private RPC URLs hidden
 */

export class ServerJsonRpcProvider extends StaticJsonRpcProvider {
  private readonly chainId: number;

  constructor(chainId: number) {
    // Use a dummy URL that will never be used
    super('http://localhost', chainId);
    this.chainId = chainId;
  }

  /**
   * Override the send method to route through our API instead of direct to RPC
   * @param method The JSON-RPC method to call
   * @param params The parameters for the JSON-RPC method
   * @returns The result from the JSON-RPC method
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async send<P = any, R = any>(method: string, params: Array<P>): Promise<R> {
    const apiUrl = '/api/rpc-proxy/';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chainId: this.chainId,
          method,
          params,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Failed with status ${response.status}`);
        } catch (e) {
          throw new Error(`Failed with status ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'RPC error');
      }

      return data.result as R;
    } catch (error) {
      console.error('Error making RPC request through server proxy:', error);
      throw error;
    }
  }

  // Override detectNetwork to manually set the network to avoid making requests
  public async detectNetwork(): Promise<Network> {
    return this.network;
  }
}
