import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useConnectionStatusContext } from '../useConnectionStatusContext';
import { useModalContext } from '../useModal';
import { useProtocolDataContext } from '../useProtocolDataContext';
import { usePoolDataCached } from './usePoolDataCached';
import { usePoolDataRPC } from './usePoolDataRPC';

export const usePoolData = () => {
  const { currentAccount } = useWeb3Context();
  const { mainTxState } = useModalContext();
  const { currentMarketData, currentChainId, currentMarket } = useProtocolDataContext();
  const { isRPCActive } = useConnectionStatusContext();

  const rpcMode =
    isRPCActive || !currentMarketData.cachingWSServerUrl || !currentMarketData.cachingServerUrl;

  const txLoading = mainTxState.loading === true;

  const { loading: cachedDataLoading } = usePoolDataCached(
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
    currentMarket,
    currentAccount,
    rpcMode || mainTxState.loading
  );

  const {
    error: rpcDataError,
    loading: rpcDataLoading,
    refresh,
  } = usePoolDataRPC(
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
    currentMarketData.addresses.UI_POOL_DATA_PROVIDER,
    !rpcMode || txLoading,
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
