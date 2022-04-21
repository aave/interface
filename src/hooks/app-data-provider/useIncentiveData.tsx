import BigNumber from 'bignumber.js';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useConnectionStatusContext } from '../useConnectionStatusContext';
import { useModalContext } from '../useModal';
import { useProtocolDataContext } from '../useProtocolDataContext';
import { useIncentivesDataCached } from './useIncentiveDataCached';
import { useIncentivesDataRPC } from './useIncentiveDataRPC';

export interface ReserveIncentiveResponse {
  incentiveAPR: string;
  rewardTokenAddress: string;
  rewardTokenSymbol: string;
}

export interface UserIncentiveResponse {
  incentiveControllerAddress: string;
  rewardTokenSymbol: string;
  rewardPriceFeed: string;
  rewardTokenDecimals: number;
  claimableRewards: BigNumber;
  assets: string[];
}

export const useIncentiveData = (skip = false) => {
  const { currentAccount } = useWeb3Context();
  const { mainTxState } = useModalContext();
  const { currentChainId, currentMarketData, currentMarket } = useProtocolDataContext();
  const { isRPCActive } = useConnectionStatusContext();

  const rpcMode =
    isRPCActive || !currentMarketData.cachingServerUrl || !currentMarketData.cachingWSServerUrl;

  const { loading: cachedDataLoading, error: cachedDataError } = useIncentivesDataCached(
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
    currentMarket,
    currentAccount,
    skip ||
      rpcMode ||
      !currentMarketData.addresses.UI_INCENTIVE_DATA_PROVIDER ||
      (mainTxState.loading ?? false)
  );

  const {
    loading: rpcDataLoading,
    error: rpcDataError,
    refresh,
  } = useIncentivesDataRPC(
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
    currentMarketData.addresses.UI_INCENTIVE_DATA_PROVIDER,
    skip ||
      !rpcMode ||
      !currentMarketData.addresses.UI_INCENTIVE_DATA_PROVIDER ||
      (mainTxState.loading ?? false),
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
    error: cachedDataError,
  };
};
