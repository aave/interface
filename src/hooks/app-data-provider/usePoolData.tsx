import { useConnectionStatusContext } from '../useConnectionStatusContext';
import { usePoolDataCached } from './usePoolDataCached';
import { usePoolDataRPC } from './usePoolDataRPC';
import { useProtocolDataContext } from '../useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

export const usePoolData = () => {
  const { currentAccount } = useWeb3Context();
  const { currentMarketData, currentChainId, currentNetworkConfig } = useProtocolDataContext();
  const { isRPCActive } = useConnectionStatusContext();

  const rpcMode =
    isRPCActive ||
    !currentNetworkConfig.cachingWSServerUrl ||
    !currentNetworkConfig.cachingServerUrl;

  const { loading: cachedDataLoading, data: cachedData } = usePoolDataCached(
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
    currentAccount,
    rpcMode
  );

  const {
    error: rpcDataError,
    loading: rpcDataLoading,
    data: rpcData,
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
      data: rpcData,
      error: rpcDataError,
      refresh,
    };
  }

  return {
    loading: cachedDataLoading,
    // TODO: fix caching data
    data: cachedData,
  };
};
