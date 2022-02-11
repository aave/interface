import { normalize, UserIncentiveData } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Reward, TxState } from 'src/helpers/types';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
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

export type ClaimRewardsModalContentProps = {
  handleClose: () => void;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const ClaimRewardsModalContent = ({ handleClose }: ClaimRewardsModalContentProps) => {
  const { user } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [claimRewardsTxState, setClaimRewardsTxState] = useState<TxState>({ success: false });

  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();

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
      const rewardBalanceUsd = Number(rewardBalance) * Number(incentive.rewardPriceFeed);

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
        balanceUsd: totalClaimableUsd,
        rewardTokenAddress: '',
      };
      userIncentives.push(allRewards);
      setSelectedReward(allRewards);
    }

    setAllRewards(userIncentives);
    setClaimableUsd(totalClaimableUsd.toString());
  }, []);

  // error handling
  useEffect(() => {
    if (claimableUsd === '0') {
      setBlockingError(ErrorType.NOT_ENOUGH_BALANCE);
    } else {
      setBlockingError(undefined);
    }
  }, [claimableUsd]);

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

  return (
    <>
      {!claimRewardsTxState.txError && !claimRewardsTxState.success && (
        <>
          <TxModalTitle title="Claim rewards" />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
          )}
          {blockingError !== undefined && (
            <Typography variant="helperText" color="red">
              {handleBlocked()}
            </Typography>
          )}
          {allRewards && allRewards.length > 1 && (
            <Typography variant="description">
              <Trans>Reward(s) to claim</Trans>
            </Typography>
          )}
          <TxModalDetails
            sx={{ mt: '30px' }}
            gasLimit={gasLimit}
            allRewards={allRewards}
            selectedReward={selectedReward}
            setSelectedReward={setSelectedReward}
          />
        </>
      )}
      {claimRewardsTxState.txError && <TxErrorView errorMessage={claimRewardsTxState.txError} />}
      {claimRewardsTxState.success && !claimRewardsTxState.txError && (
        <TxSuccessView action="Claimed" amount={selectedReward?.balanceUsd} />
      )}
      {claimRewardsTxState.gasEstimationError && (
        <GasEstimationError error={claimRewardsTxState.gasEstimationError} />
      )}
      <ClaimRewardsActions
        setClaimRewardsTxState={setClaimRewardsTxState}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        setGasLimit={setGasLimit}
        selectedReward={selectedReward ?? ({} as Reward)}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
