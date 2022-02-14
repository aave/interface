import React, { useEffect, useState } from 'react';
import { Link, Typography } from '@mui/material';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { TxState } from 'src/helpers/types';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { Trans } from '@lingui/macro';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useStakeData } from 'src/hooks/stake-data-provider/StakeDataProvider';
import { stakeConfig } from 'src/ui-config/stakeConfig';
import { StakeCooldownActions } from './StakeCooldownActions';

export type StakeCooldownProps = {
  stakeAssetName: string;
  handleClose: () => void;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  ALREADY_ON_COOLDOWN,
}

type StakingType = 'aave' | 'bpt';

export const StakeCooldownModalContent = ({ stakeAssetName, handleClose }: StakeCooldownProps) => {
  const data = useStakeData();
  const { chainId: connectedChainId } = useWeb3Context();

  // states
  const [txState, setTxState] = useState<TxState>({ success: false });
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();

  const cooldown =
    data.stakeUserResult?.stakeUserUIData[stakeAssetName as StakingType].userCooldown;
  const stakedAmount =
    data.stakeUserResult?.stakeUserUIData[stakeAssetName as StakingType].stakeTokenUserBalance;

  // error handler
  useEffect(() => {
    if (stakedAmount === '0') {
      setBlockingError(ErrorType.NOT_ENOUGH_BALANCE);
    } else if (cooldown !== 0) {
      setBlockingError(ErrorType.ALREADY_ON_COOLDOWN);
    } else {
      setBlockingError(undefined);
    }
  }, [cooldown, stakedAmount]);

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>Nothing staked</Trans>;
      case ErrorType.ALREADY_ON_COOLDOWN:
        return <Trans>Already on cooldown</Trans>;
      default:
        return null;
    }
  };

  // is Network mismatched
  const stakingChain = stakeConfig.chainId;
  const networkConfig = getNetworkConfig(stakingChain);
  const isWrongNetwork = connectedChainId !== stakingChain;

  return (
    <>
      {!txState.txError && !txState.success && (
        <>
          <TxModalTitle title="Cooldown to unstake" />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
          )}
          <>
            <Typography variant="description">
              <Trans>
                The cooldown period is 10 days. After 10 days of cooldown, you will enter unstake
                window of 2 days. You will continue receiving rewards during cooldown and unstake
                window.
              </Trans>{' '}
              <Typography component={Link} variant="description">
                Learn more.
              </Typography>
            </Typography>
          </>
          {blockingError !== undefined && (
            <Typography variant="helperText" color="red">
              {handleBlocked()}
            </Typography>
          )}

          <TxModalDetails sx={{ mt: '30px' }} gasLimit={gasLimit} />
        </>
      )}
      {txState.txError && <TxErrorView errorMessage={txState.txError} />}
      {txState.success && !txState.txError && <TxSuccessView action="Stake coldowwn activated" />}
      {txState.gasEstimationError && <GasEstimationError error={txState.gasEstimationError} />}
      <StakeCooldownActions
        sx={{ mt: '48px' }}
        setTxState={setTxState}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        setGasLimit={setGasLimit}
        blocked={blockingError !== undefined}
        selectedToken={stakeAssetName}
      />
    </>
  );
};
