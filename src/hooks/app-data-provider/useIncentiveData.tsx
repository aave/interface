import BigNumber from 'bignumber.js';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useConnectionStatusContext } from '../useConnectionStatusContext';
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
  const { currentChainId, currentMarketData, currentNetworkConfig } = useProtocolDataContext();
  const { isRPCActive } = useConnectionStatusContext();

  const rpcMode =
    isRPCActive ||
    !currentNetworkConfig.cachingServerUrl ||
    !currentNetworkConfig.cachingWSServerUrl;

  const { loading: cachedDataLoading, error: cachedDataError } = useIncentivesDataCached(
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
    currentAccount,
    skip || rpcMode || !currentMarketData.addresses.UI_INCENTIVE_DATA_PROVIDER
  );

  const {
    loading: rpcDataLoading,
    error: rpcDataError,
    refresh,
  } = useIncentivesDataRPC(
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
    currentMarketData.addresses.UI_INCENTIVE_DATA_PROVIDER,
    skip || !rpcMode || !currentMarketData.addresses.UI_INCENTIVE_DATA_PROVIDER,
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
