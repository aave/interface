import { providers } from 'ethers';
import { useMemo } from 'react';
import type { Account, Chain, Client, Transport } from 'viem';
import { Config, useClient, useConnectorClient } from 'wagmi';

export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = getNetwork(chain);
  return new providers.JsonRpcProvider(transport.url, network);
}

/** Hook to convert a viem Client to an ethers.js Provider. */
export function useEthersProvider({ chainId }: { chainId?: number | undefined } = {}) {
  const client = useClient<Config>({ chainId });
  return useMemo(() => (client ? clientToProvider(client) : undefined), [client]);
}

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = getNetwork(chain);
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Hook to convert a Viem Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

function getNetwork(chain: Chain) {
  // if chain is undefined, it means that the client is connected to a chain that is not supported by the app
  const network = {
    chainId: chain?.id || -1,
    name: chain?.name || 'unknown',
    ensAddress: chain?.contracts?.ensRegistry?.address || undefined,
  };
  return network;
}
