import {
  type Address,
  type Chain,
  type PublicClient,
  createPublicClient,
  http,
  isAddress,
} from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

import { getNetworkConfig } from './marketsAndNetworksConfig';

let ensPublicClient: PublicClient | undefined;

const getEnsPublicClient = (): PublicClient => {
  if (!ensPublicClient) {
    const { publicJsonRPCUrl } = getNetworkConfig(mainnet.id);
    ensPublicClient = createPublicClient({
      transport: http(publicJsonRPCUrl[0]),
      chain: mainnet as Chain,
    });
  }
  return ensPublicClient;
};

export const lookupEnsName = async (address: string): Promise<string | null> => {
  if (!isAddress(address)) return null;

  try {
    const name = await getEnsPublicClient().getEnsName({
      address,
    });
    return name ?? null;
  } catch (error) {
    console.error('ENS name lookup error', error);
    return null;
  }
};

export const resolveEnsAddress = async (name: string): Promise<Address | null> => {
  let normalizedName: string;
  try {
    normalizedName = normalize(name);
  } catch {
    return null;
  }

  try {
    const address = await getEnsPublicClient().getEnsAddress({
      name: normalizedName,
    });
    return address ?? null;
  } catch (error) {
    console.error('ENS address lookup error', error);
    return null;
  }
};
