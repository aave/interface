import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useConnectionStatusContext } from '../useConnectionStatusContext';
import { useProtocolDataContext } from '../useProtocolDataContext';
import { usePoolDataCached } from './usePoolDataCached';
import { usePoolDataRPC } from './usePoolDataRPC';

export const usePoolData = () => {
  const { currentAccount } = useWeb3Context();
  const { currentMarketData, currentChainId, currentNetworkConfig } = useProtocolDataContext();
  const { isRPCActive } = useConnectionStatusContext();

  const rpcMode =
    isRPCActive ||
    !currentNetworkConfig.cachingWSServerUrl ||
    !currentNetworkConfig.cachingServerUrl;

  const { loading: cachedDataLoading } = usePoolDataCached(
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
    currentAccount,
    rpcMode
  );

  const {
    error: rpcDataError,
    loading: rpcDataLoading,
    refresh,
  } = usePoolDataRPC(
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
    currentMarketData.addresses.UI_POOL_DATA_PROVIDER,
    !rpcMode,
    currentAccount
  );

  if (rpcMode) {
    return {
      loading: rpcDataLoading,
      error: rpcDataError,
      refresh,
    };
  }

  return {
    loading: cachedDataLoading,
  };
};
