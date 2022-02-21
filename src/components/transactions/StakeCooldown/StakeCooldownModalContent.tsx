import React, { useEffect, useState } from 'react';
import { Alert, Checkbox, FormControlLabel, Link, Typography } from '@mui/material';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { Trans } from '@lingui/macro';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useStakeData } from 'src/hooks/stake-data-provider/StakeDataProvider';
import { getStakeConfig } from 'src/ui-config/stakeConfig';
import { StakeCooldownActions } from './StakeCooldownActions';
import { GasStation } from '../GasStation/GasStation';
import { parseUnits } from 'ethers/lib/utils';
import { useModalContext } from 'src/hooks/useModal';

export type StakeCooldownProps = {
  stakeAssetName: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  ALREADY_ON_COOLDOWN,
}

type StakingType = 'aave' | 'bpt';

export const StakeCooldownModalContent = ({ stakeAssetName }: StakeCooldownProps) => {
  const { stakeUserResult, stakeGeneralResult } = useStakeData();
  const { chainId: connectedChainId } = useWeb3Context();
  const stakeConfig = getStakeConfig();
  const { gasLimit, mainTxState: txState } = useModalContext();

  // states
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();
  const [cooldownCheck, setCooldownCheck] = useState(false);

  const userStakeData = stakeUserResult?.stakeUserUIData[stakeAssetName as StakingType];
  const stakeData = stakeGeneralResult?.stakeGeneralUIData[stakeAssetName as StakingType];

  // Cooldown logic
  const now = Date.now() / 1000;
  const stakeCooldownSeconds = stakeData?.stakeCooldownSeconds || 0;
  const userCooldown = userStakeData?.userCooldown || 0;
  const stakeUnstakeWindow = stakeData?.stakeUnstakeWindow || 0;
  const userCooldownDelta = now - userCooldown;
  const isCooldownActive = userCooldownDelta < stakeCooldownSeconds + stakeUnstakeWindow;

  const stakedAmount =
    stakeUserResult?.stakeUserUIData[stakeAssetName as StakingType].stakeTokenUserBalance;

  // error handler
  useEffect(() => {
    if (stakedAmount === '0') {
      setBlockingError(ErrorType.NOT_ENOUGH_BALANCE);
    } else if (isCooldownActive) {
      setBlockingError(ErrorType.ALREADY_ON_COOLDOWN);
    } else {
      setBlockingError(undefined);
    }
  }, [isCooldownActive, stakedAmount]);

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

  if (txState.txError) return <TxErrorView errorMessage={txState.txError} />;
  if (txState.success) return <TxSuccessView action="Stake cooldown activated" />;

  return (
    <>
      <TxModalTitle title="Cooldown to unstake" />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
      )}
      <>
        <Typography variant="description">
          <Trans>
            The cooldown period is 10 days. After 10 days of cooldown, you will enter unstake window
            of 2 days. You will continue receiving rewards during cooldown and unstake window.
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

      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />
      <Alert severity="error">
        <Typography variant="caption">
          <Trans>
            If you DO NOT unstake within 2 days of unstake widow, you will need to activate cooldown
            process again.
          </Trans>
        </Typography>
      </Alert>
      <FormControlLabel
        control={
          <Checkbox
            checked={cooldownCheck}
            onClick={() => setCooldownCheck(!cooldownCheck)}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        }
        label={<Trans>I understand how cooldown (10 days) and unstaking (2 days) work</Trans>}
      />

      {txState.gasEstimationError && <GasEstimationError error={txState.gasEstimationError} />}

      <StakeCooldownActions
        sx={{ mt: '48px' }}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined || !cooldownCheck}
        selectedToken={stakeAssetName}
      />
    </>
  );
};
