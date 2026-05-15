import { chainId as toSdkChainId } from '@aave/react';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { marketsData } from 'src/utils/marketsAndNetworksConfig';

/**
 * Resolves the market the sGHO / stkGHO surfaces should operate against.
 *
 * Both products only exist on Ethereum mainnet, but when a Tenderly fork is
 * enabled (`FORK_ENABLED` + `FORK_BASE_CHAIN_ID=1`) the codebase auto-adds a
 * `fork_proto_mainnet_v3` market alongside the real one. We prefer the fork
 * when it exists so dev/testing runs against the forked state automatically.
 */
export const useSavingsMarketData = () => {
  const forkKey = `fork_${CustomMarket.proto_mainnet_v3}`;
  const marketKey = (
    marketsData[forkKey] ? forkKey : CustomMarket.proto_mainnet_v3
  ) as CustomMarket;
  const { chainId } = marketsData[marketKey];

  return {
    marketKey,
    chainId,
    sdkChainId: toSdkChainId(chainId),
  };
};
