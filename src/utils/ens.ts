import { ChainId } from '@aave/contract-helpers';
import type { Address } from 'viem';
import { createPublicClient, fallback, http, isAddress } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

import { getNetworkConfig } from './marketsAndNetworksConfig';

const mainnetRpcUrls = getNetworkConfig(ChainId.mainnet).publicJsonRPCUrl;

const ensClient = createPublicClient({
  chain: mainnet,
  transport: fallback(mainnetRpcUrls.map((rpcUrl) => http(rpcUrl))),
});

const ENS_BATCH_SIZE = 25;

export type EnsProfile = {
  name: string;
  avatar?: string;
};

export const getEnsName = async (address: string): Promise<string | null> => {
  if (!isAddress(address)) return null;

  try {
    const name = await ensClient.getEnsName({ address: address as Address });
    return name ? normalize(name) : null;
  } catch (error) {
    console.error('ENS name lookup error', error);
    return null;
  }
};

export const getEnsAvatar = async (name: string): Promise<string | undefined> => {
  try {
    return (await ensClient.getEnsAvatar({ name: normalize(name) })) ?? undefined;
  } catch (error) {
    console.error('ENS avatar lookup error', error);
    return undefined;
  }
};

export const getEnsProfilesMap = async (
  addresses: string[]
): Promise<Record<string, EnsProfile>> => {
  const normalizedAddresses = Array.from(
    new Set(
      addresses
        .map((address) => address.toLowerCase())
        .filter((address): address is Address => isAddress(address))
    )
  );

  const ensProfiles: Record<string, EnsProfile> = {};

  for (let i = 0; i < normalizedAddresses.length; i += ENS_BATCH_SIZE) {
    const batch = normalizedAddresses.slice(i, i + ENS_BATCH_SIZE);
    const names = await Promise.all(batch.map((address) => getEnsName(address)));
    const avatars = await Promise.all(
      names.map((name) => (name ? getEnsAvatar(name) : Promise.resolve(undefined)))
    );

    batch.forEach((address, index) => {
      const name = names[index];
      if (name) {
        ensProfiles[address] = {
          name,
          avatar: avatars[index],
        };
      }
    });
  }

  return ensProfiles;
};

export const getEnsNamesMap = async (addresses: string[]): Promise<Record<string, string>> => {
  const ensProfiles = await getEnsProfilesMap(addresses);
  return Object.fromEntries(
    Object.entries(ensProfiles).map(([address, profile]) => [address, profile.name])
  );
};
