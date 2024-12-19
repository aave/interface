import { type Config, getConnectorClient } from '@wagmi/core';
import { providers } from 'ethers';
import type { Account, Chain, Client, Transport } from 'viem';

/** Action to convert a Viem Client to an ethers.js Signer. */
export async function getEthersProvider(config: Config, { chainId }: { chainId?: number } = {}) {
  const client = await getConnectorClient(config, { chainId });
  return clientToWeb3Provider(client);
}

function clientToWeb3Provider(client: Client<Transport, Chain, Account>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  return provider;
}
