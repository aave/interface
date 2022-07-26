import React from 'react';
import { Typography } from '@mui/material';
import { normalize } from '@aave/math-utils';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { DetailsNumberLineWithSub, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { Trans } from '@lingui/macro';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useStakeData } from 'src/hooks/stake-data-provider/StakeDataProvider';
import { stakeConfig } from 'src/ui-config/stakeConfig';
import { StakeRewardClaimActions } from './StakeRewardClaimActions';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

export type StakeRewardClaimProps = {
  stakeAssetName: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

type StakingType = 'aave' | 'bpt';

export const StakeRewardClaimModalContent = ({ stakeAssetName }: StakeRewardClaimProps) => {
  const data = useStakeData();
  const stakeData = data.stakeGeneralResult?.stakeGeneralUIData[stakeAssetName as StakingType];
  const { chainId: connectedChainId } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const { currentNetworkConfig } = useProtocolDataContext();

  // hardcoded as all rewards will be in aave token
  const rewardsSymbol = 'AAVE';

  const amount = '-1';
  const maxAmountToClaim = normalize(
    data.stakeUserResult?.stakeUserUIData[stakeAssetName as StakingType].userIncentivesToClaim ||
      '0',
    18
  );

  // staking token usd value
  const amountInUsd =
    Number(maxAmountToClaim) *
    (Number(normalize(stakeData?.stakeTokenPriceEth || 1, 18)) /
      Number(normalize(data.stakeGeneralResult?.stakeGeneralUIData.usdPriceEth || 1, 18)));

  // error handler
  let blockingError: ErrorType | undefined = undefined;
  if (maxAmountToClaim === '0') {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE;
  }

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>No rewards to claim</Trans>;
      default:
        return null;
    }
  };

  // is Network mismatched
  const stakingChain = stakeConfig.chainId;
  const isStakeFork =
    currentNetworkConfig.isFork && currentNetworkConfig.underlyingChainId === stakingChain;
  const isWrongNetwork = !isStakeFork && connectedChainId !== stakingChain;

  const networkConfig = getNetworkConfig(stakingChain);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success)
    return (
      <TxSuccessView
        action={<Trans>Claimed</Trans>}
        amount={maxAmountToClaim}
        symbol={rewardsSymbol}
      />
    );

  return (
    <>
      <TxModalTitle title="Claim" symbol={rewardsSymbol} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
      )}
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLineWithSub
          description={<Trans>Amount</Trans>}
          symbol={rewardsSymbol}
          futureValue={maxAmountToClaim}
          futureValueUSD={amountInUsd.toString()}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <StakeRewardClaimActions
        sx={{ mt: '48px' }}
        amountToClaim={amount}
        isWrongNetwork={isWrongNetwork}
        symbol={rewardsSymbol}
        blocked={blockingError !== undefined}
        selectedToken={stakeAssetName}
      />
    </>
  );
};
