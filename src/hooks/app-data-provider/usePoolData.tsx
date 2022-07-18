import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useModalContext } from '../useModal';
import { useProtocolDataContext } from '../useProtocolDataContext';
import { usePoolDataRPC } from './usePoolDataRPC';

export const usePoolData = () => {
  const { currentAccount } = useWeb3Context();
  const { mainTxState } = useModalContext();
  const { currentMarketData, currentChainId } = useProtocolDataContext();

  const txLoading = mainTxState.loading === true;

  const {
    error: rpcDataError,
    loading: rpcDataLoading,
    refresh,
  } = usePoolDataRPC(
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
    currentMarketData.addresses.UI_POOL_DATA_PROVIDER,
    txLoading,
    currentAccount
  );

  return {
    loading: rpcDataLoading,
    error: rpcDataError,
    refresh,
  };
};
