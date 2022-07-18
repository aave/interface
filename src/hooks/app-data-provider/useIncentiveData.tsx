import BigNumber from 'bignumber.js';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useModalContext } from '../useModal';
import { useProtocolDataContext } from '../useProtocolDataContext';
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
  const { currentChainId, currentMarketData } = useProtocolDataContext();

  const {
    loading: rpcDataLoading,
    error: rpcDataError,
    refresh,
  } = useIncentivesDataRPC(
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
    currentMarketData.addresses.UI_INCENTIVE_DATA_PROVIDER,
    skip ||
      !currentMarketData.addresses.UI_INCENTIVE_DATA_PROVIDER ||
      (mainTxState.loading ?? false),
    currentAccount
  );

  return {
    loading: rpcDataLoading,
    error: rpcDataError,
    refresh,
  };
};
