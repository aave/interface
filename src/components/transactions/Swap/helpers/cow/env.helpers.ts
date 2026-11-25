import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter';
import { ethers } from 'ethers';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { getAccount, getWalletClient } from 'wagmi/actions';

export const getCowAdapter = async (chainId: number) => {
  const { connector } = getAccount(wagmiConfig);
  let eip1193Provider = connector ? await connector.getProvider({ chainId }) : undefined;
  if (!eip1193Provider) {
    const walletClient = await getWalletClient(wagmiConfig, { chainId });
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }
    eip1193Provider =
      walletClient.transport?.value ||
      (typeof window !== 'undefined' ? window.ethereum : undefined);
  }
  if (!eip1193Provider) {
    throw new Error('No EIP-1193 provider available for signer');
  }
  const web3Provider = new ethers.providers.Web3Provider(eip1193Provider, 'any');
  const signer = web3Provider.getSigner();
  const provider = getProvider(chainId); // Use RPC proxy
  return new EthersV5Adapter({
    provider,
    signer,
  });
};
