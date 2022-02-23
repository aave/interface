import { normalize, UserIncentiveData } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Reward } from 'src/helpers/types';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { ClaimRewardsActions } from './ClaimRewardsActions';

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const ClaimRewardsModalContent = () => {
  const { gasLimit, mainTxState: claimRewardsTxState } = useModalContext();
  const { user, reserves } = useAppDataContext();
  const { currentChainId, currentMarketData, currentMarket } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();
  const [claimableUsd, setClaimableUsd] = useState('0');
  const [selectedReward, setSelectedReward] = useState<Reward>();
  const [allRewards, setAllRewards] = useState<Reward[]>([]);

  const networkConfig = getNetworkConfig(currentChainId);

  // get all rewards
  useEffect(() => {
    const userIncentives: Reward[] = [];
    let totalClaimableUsd = Number(claimableUsd);
    const allAssets: string[] = [];
    Object.keys(user.calculatedUserIncentives).forEach((rewardTokenAddress) => {
      const incentive: UserIncentiveData = user.calculatedUserIncentives[rewardTokenAddress];
      const rewardBalance = normalize(incentive.claimableRewards, incentive.rewardTokenDecimals);

      let tokenPrice = 0;
      // getting price from reserves for the native rewards for v2 markets
      if (!currentMarketData.v3 && Number(rewardBalance) > 0) {
        if (currentMarket === 'proto_mainnet') {
          const aave = reserves.find((reserve) => reserve.symbol === 'AAVE');
          tokenPrice = aave ? Number(aave.priceInUSD) : 0;
        } else {
          reserves.forEach((reserve) => {
            if (reserve.isWrappedBaseAsset) {
              tokenPrice = Number(reserve.priceInUSD);
            }
          });
        }
      } else {
        tokenPrice = Number(incentive.rewardPriceFeed);
      }

      const rewardBalanceUsd = Number(rewardBalance) * tokenPrice;

      incentive.assets.forEach((asset) => {
        if (allAssets.indexOf(asset) === -1) {
          allAssets.push(asset);
        }
      });

      userIncentives.push({
        assets: incentive.assets,
        incentiveControllerAddress: incentive.incentiveControllerAddress,
        symbol: incentive.rewardTokenSymbol,
        balance: rewardBalance,
        balanceUsd: rewardBalanceUsd.toString(),
        rewardTokenAddress,
      });

      totalClaimableUsd = totalClaimableUsd + Number(rewardBalanceUsd);
    });

    if (userIncentives.length === 1) {
      setSelectedReward(userIncentives[0]);
    } else if (userIncentives.length > 1 && !selectedReward) {
      const allRewards = {
        assets: allAssets,
        incentiveControllerAddress: userIncentives[0].incentiveControllerAddress,
        symbol: 'all',
        balance: '0',
        balanceUsd: totalClaimableUsd.toString(),
        rewardTokenAddress: '',
      };
      userIncentives.push(allRewards);
      setSelectedReward(allRewards);
    }

    setAllRewards(userIncentives);
    setClaimableUsd(totalClaimableUsd.toString());
  }, []);

  // error handling
  let blockingError: ErrorType | undefined = undefined;
  if (claimableUsd === '0') {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE;
  }

  // error handling render
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>Your reward balance is 0</Trans>;
      default:
        return null;
    }
  };

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  if (claimRewardsTxState.txError)
    return <TxErrorView errorMessage={claimRewardsTxState.txError} />;
  if (claimRewardsTxState.success)
    return <TxSuccessView action="Claimed" amount={selectedReward?.balanceUsd} />;

  return (
    <>
      <TxModalTitle title="Claim rewards" />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}
      {allRewards && allRewards.length > 1 && (
        <Typography>
          <Trans>Reward(s) to claim</Trans>
        </Typography>
      )}

      <TxModalDetails
        gasLimit={gasLimit}
        allRewards={allRewards}
        selectedReward={selectedReward}
        setSelectedReward={setSelectedReward}
      />

      {claimRewardsTxState.gasEstimationError && (
        <GasEstimationError error={claimRewardsTxState.gasEstimationError} />
      )}

      <ClaimRewardsActions
        isWrongNetwork={isWrongNetwork}
        selectedReward={selectedReward ?? ({} as Reward)}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
