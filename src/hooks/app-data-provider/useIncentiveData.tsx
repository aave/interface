import BigNumber from 'bignumber.js';
import { useConnectionStatusContext } from '../useConnectionStatusContext';
import { useIncentivesDataCached } from './useIncentiveDataCached';
import { useIncentivesDataRPC } from './useIncentiveDataRPC';
import { useProtocolDataContext } from '../useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

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

  const {
    loading: cachedDataLoading,
    data: cachedData,
    error: cachedDataError,
  } = useIncentivesDataCached(
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
    currentAccount,
    skip || rpcMode || !currentMarketData.addresses.UI_INCENTIVE_DATA_PROVIDER
  );

  const {
    data: rpcData,
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
      data: rpcData,
      error: rpcDataError,
      refresh,
    };
  }

  return {
    loading: cachedDataLoading,
    data: cachedData,
    error: cachedDataError,
  };
};
