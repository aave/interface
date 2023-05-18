import { valueToBigNumber } from '@aave/math-utils';
import { ArrowDownIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, FormControlLabel, SvgIcon, Typography } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import React, { useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { stakeConfig } from 'src/ui-config/stakeConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { formattedTime, timeText } from '../../../helpers/timeHelper';
import { Link } from '../../primitives/Link';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasStation } from '../GasStation/GasStation';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { StakeCooldownActions } from './StakeCooldownActions';

export type StakeCooldownProps = {
  stakeAssetName: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  ALREADY_ON_COOLDOWN,
}

type StakingType = 'aave' | 'bpt';

export const StakeCooldownModalContent = ({ stakeAssetName }: StakeCooldownProps) => {
  const [stakeUserResult, stakeGeneralResult] = useRootStore((state) => [
    state.stakeUserResult,
    state.stakeGeneralResult,
  ]);
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const { currentNetworkConfig, currentChainId } = useProtocolDataContext();

  // states
  const [cooldownCheck, setCooldownCheck] = useState(false);

  const userStakeData = stakeUserResult?.[stakeAssetName as StakingType];
  const stakeData = stakeGeneralResult?.[stakeAssetName as StakingType];

  // Cooldown logic
  const now = Date.now() / 1000;
  const stakeCooldownSeconds = stakeData?.stakeCooldownSeconds || 0;
  const userCooldown = userStakeData?.userCooldown || 0;
  const stakeUnstakeWindow = stakeData?.stakeUnstakeWindow || 0;
  const userCooldownDelta = now - userCooldown;
  const isCooldownActive = userCooldownDelta < stakeCooldownSeconds + stakeUnstakeWindow;

  const cooldownPercent = valueToBigNumber(stakeCooldownSeconds)
    .dividedBy(stakeCooldownSeconds + stakeUnstakeWindow)
    .multipliedBy(100)
    .toNumber();
  const unstakeWindowPercent = valueToBigNumber(stakeUnstakeWindow)
    .dividedBy(stakeCooldownSeconds + stakeUnstakeWindow)
    .multipliedBy(100)
    .toNumber();

  const cooldownLineWidth = cooldownPercent < 15 ? 15 : cooldownPercent > 85 ? 85 : cooldownPercent;
  const unstakeWindowLineWidth =
    unstakeWindowPercent < 15 ? 15 : unstakeWindowPercent > 85 ? 85 : unstakeWindowPercent;

  const stakedAmount = stakeUserResult?.[stakeAssetName as StakingType].stakeTokenRedeemableAmount;

  // error handler
  let blockingError: ErrorType | undefined = undefined;
  if (stakedAmount === '0') {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE;
  } else if (isCooldownActive) {
    blockingError = ErrorType.ALREADY_ON_COOLDOWN;
  }

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
  const stakingChain =
    currentNetworkConfig.isFork && currentNetworkConfig.underlyingChainId === stakeConfig.chainId
      ? currentChainId
      : stakeConfig.chainId;
  const isWrongNetwork = connectedChainId !== stakingChain;

  const networkConfig = getNetworkConfig(stakingChain);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success) return <TxSuccessView action={<Trans>Stake cooldown activated</Trans>} />;

  const timeMessage = (time: number) => {
    return `${formattedTime(time)} ${timeText(time)}`;
  };

  return (
    <>
      <TxModalTitle title="Cooldown to unstake" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
      )}
      <Typography variant="description" sx={{ mb: 6 }}>
        <Trans>
          The cooldown period is {timeMessage(stakeCooldownSeconds)}. After{' '}
          {timeMessage(stakeCooldownSeconds)} of cooldown, you will enter unstake window of{' '}
          {timeMessage(stakeUnstakeWindow)}. You will continue receiving rewards during cooldown and
          unstake window.
        </Trans>{' '}
        <Link
          variant="description"
          href="https://docs.aave.com/faq/migration-and-staking"
          sx={{ textDecoration: 'underline' }}
        >
          <Trans>Learn more</Trans>
        </Link>
        .
      </Typography>

      <Box mb={6}>
        <Box
          sx={{
            width: `${unstakeWindowLineWidth}%`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            flexDirection: 'column',
            ml: 'auto',
          }}
        >
          <Typography variant="helperText" mb={1}>
            <Trans>You unstake here</Trans>
          </Typography>
          <SvgIcon sx={{ fontSize: '13px' }}>
            <ArrowDownIcon />
          </SvgIcon>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
          <Box
            sx={{
              height: '2px',
              width: `${cooldownLineWidth}%`,
              bgcolor: 'error.main',
              position: 'relative',
              '&:after': {
                content: "''",
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'error.main',
                width: '2px',
                height: '8px',
                borderRadius: '2px',
              },
            }}
          />
          <Box
            sx={{
              height: '2px',
              width: `${unstakeWindowLineWidth}%`,
              bgcolor: 'success.main',
              position: 'relative',
              '&:after, &:before': {
                content: "''",
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'success.main',
                width: '2px',
                height: '8px',
                borderRadius: '2px',
              },
              '&:before': {
                left: 0,
              },
              '&:after': {
                right: 0,
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="helperText" mb={1}>
              <Trans>Cooldown period</Trans>
            </Typography>
            <Typography variant="subheader2" color="error.main">
              <Trans>{timeMessage(stakeCooldownSeconds)}</Trans>
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="helperText" mb={1}>
              <Trans>Unstake window</Trans>
            </Typography>
            <Typography variant="subheader2" color="success.main">
              <Trans>{timeMessage(stakeUnstakeWindow)}</Trans>
            </Typography>
          </Box>
        </Box>
      </Box>

      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}

      <Warning severity="error">
        <Typography variant="caption">
          <Trans>
            If you DO NOT unstake within {timeMessage(stakeUnstakeWindow)} of unstake window, you
            will need to activate cooldown process again.
          </Trans>
        </Typography>
      </Warning>

      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />

      <FormControlLabel
        sx={{ mt: 12 }}
        control={
          <Checkbox
            checked={cooldownCheck}
            onClick={() => setCooldownCheck(!cooldownCheck)}
            inputProps={{ 'aria-label': 'controlled' }}
            data-cy={`cooldownAcceptCheckbox`}
          />
        }
        label={
          <Trans>
            I understand how cooldown ({timeMessage(stakeCooldownSeconds)}) and unstaking (
            {timeMessage(stakeUnstakeWindow)}) work
          </Trans>
        }
      />

      {txError && <GasEstimationError txError={txError} />}

      <StakeCooldownActions
        sx={{ mt: '48px' }}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined || !cooldownCheck}
        selectedToken={stakeAssetName}
      />
    </>
  );
};
