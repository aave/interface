import { ChainId } from '@aave/contract-helpers';
import { providers as ethersProviders } from 'ethers';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

const providers: { [network: string]: ethersProviders.Provider } = {};

export const useProvider = (chainId: ChainId) => {
  let foo = false;
  if (typeof window !== 'undefined') {
    foo = Boolean(localStorage.getItem('useWalletProvider'));
  }
  console.log(foo);

  const { provider } = useWeb3Context();

  if (foo) {
    console.log('useWalletProvider');
    return { provider };
  }

  if (!providers[chainId]) {
    const config = getNetworkConfig(chainId);
    const chainProviders: ethersProviders.FallbackProviderConfig[] = [];
    if (config.privateJsonRPCUrl) {
      chainProviders.push({
        provider: new ethersProviders.StaticJsonRpcProvider(config.privateJsonRPCUrl, chainId),
        priority: 0,
      });
    }
    if (config.publicJsonRPCUrl.length) {
      config.publicJsonRPCUrl.map((rpc, ix) =>
        chainProviders.push({
          provider: new ethersProviders.StaticJsonRpcProvider(rpc, chainId),
          priority: ix + 1,
        })
      );
    }
    if (!chainProviders.length) {
      throw new Error(`${chainId} has no jsonRPCUrl configured`);
    }
    if (chainProviders.length === 1) {
      providers[chainId] = chainProviders[0].provider;
    } else {
      providers[chainId] = new ethersProviders.FallbackProvider(chainProviders, 1);
    }
  }
  console.log('useProvider');
  return { provider: providers[chainId] };
};
