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
  const [rewardsClaimTxState, setRewardsClaimTxState] = useState<TxState>({ success: false });

  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();

  const [claimableUsd, setClaimableUsd] = useState('0');
  const [selectedReward, setSelectedReward] = useState<Reward | undefined>();
  const [allRewards, setAllRewards] = useState<Reward[]>([]);

  const networkConfig = getNetworkConfig(currentChainId);

  // get all rewards
  useEffect(() => {
    const userIncentives: Reward[] = [];
    let totalClaimableUsd = claimableUsd;
    Object.keys(user.calculatedUserIncentives).forEach((incentiveKey) => {
      const incentive: UserIncentiveData = user.calculatedUserIncentives[incentiveKey];
      const rewardBalance = normalize(incentive.claimableRewards, incentive.rewardTokenDecimals);
      const rewardBalanceUsd = Number(rewardBalance) * Number(incentive.rewardPriceFeed);

      userIncentives.push({
        assets: incentive.assets,
        incentiveControllerAddress: incentive.incentiveControllerAddress,
        symbol: incentive.rewardTokenSymbol,
        balance: rewardBalance,
        balanceUsd: rewardBalanceUsd.toString(),
      });

      totalClaimableUsd = totalClaimableUsd + rewardBalanceUsd;
    });

    if (userIncentives.length === 1) {
      setSelectedReward(userIncentives[0]);
    } else if (userIncentives.length > 1) {
      setSelectedReward({
        assets: [],
        incentiveControllerAddress: userIncentives[0].incentiveControllerAddress,
        symbol: 'Claim all rewards',
        balance: '0',
        balanceUsd: totalClaimableUsd,
      });
    }

    setAllRewards(userIncentives);
    setClaimableUsd(totalClaimableUsd.toString());
  }, [user.calculatedUserIncentives]);

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
  console.log('selected reward: ', selectedReward);
  console.log('all rewards', allRewards);
  return (
    <>
      {!rewardsClaimTxState.txError && !rewardsClaimTxState.success && (
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
          <Typography variant="description">
            <Trans>Reward(s) to claim</Trans>
          </Typography>
          <TxModalDetails
            sx={{ mt: '30px' }}
            gasLimit={gasLimit}
            allRewards={allRewards}
            selectedReward={selectedReward}
            setSelectedReward={setSelectedReward}
          />
        </>
      )}
      {rewardsClaimTxState.txError && <TxErrorView errorMessage={rewardsClaimTxState.txError} />}
      {rewardsClaimTxState.success && !rewardsClaimTxState.txError && (
        <TxSuccessView
          action="Claimed"
          amount={
            selectedReward?.symbol === 'Claim all rewards'
              ? claimableUsd
              : selectedReward?.balanceUsd
          }
        />
      )}
      {rewardsClaimTxState.gasEstimationError && (
        <GasEstimationError error={rewardsClaimTxState.gasEstimationError} />
      )}
      {/* <SupplyActions
        sx={{ mt: '48px' }}
        rewardsClaimTxState={rewardsClaimTxState}
        poolReserve={poolReserve}
        amountToSupply={amountToSupply}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        setGasLimit={setGasLimit}
        poolAddress={supplyUnWrapped ? underlyingAsset : poolReserve.underlyingAsset}
        symbol={supplyUnWrapped ? networkConfig.baseAssetSymbol : poolReserve.symbol}
        blocked={blockingError !== undefined}
      /> */}
    </>
  );
};
