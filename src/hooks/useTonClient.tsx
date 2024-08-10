import { getHttpEndpoint, getHttpV4Endpoint } from '@orbs-network/ton-access';
import { TonClient, TonClient4 } from '@ton/ton';

import { useAsyncInitialize } from './useAsyncInitialize';

export function useTonClient() {
  return useAsyncInitialize(
    async () =>
      new TonClient4({
        endpoint: await getHttpV4Endpoint({ network: 'testnet' }),
      })
  );
}

export function useTonClientV2() {
  return useAsyncInitialize(
    async () =>
      new TonClient({
        endpoint: await getHttpEndpoint({ network: 'testnet' }),
      })
  );
}
