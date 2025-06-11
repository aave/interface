import { valueToBigNumber } from '@aave/math-utils';
import { ArrowDownIcon, CalendarIcon } from '@heroicons/react/outline';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, FormControlLabel, Stack, SvgIcon, Typography } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import dayjs from 'dayjs';
import { parseUnits } from 'ethers/lib/utils';
import React, { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Warning } from 'src/components/primitives/Warning';
import { TxErrorView } from 'src/components/transactions/FlowCommons/Error';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { TxSuccessView } from 'src/components/transactions/FlowCommons/Success';
import { TxModalTitle } from 'src/components/transactions/FlowCommons/TxModalTitle';
import { GasStation } from 'src/components/transactions/GasStation/GasStation';
import { ChangeNetworkWarning } from 'src/components/transactions/Warnings/ChangeNetworkWarning';
import { timeMessage } from 'src/helpers/timeHelper';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';

import { StakeCooldownActions } from './StakeCooldownActions';

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  ALREADY_ON_COOLDOWN,
}

type CalendarEvent = {
  title: string;
  start: string;
  end: string;
  description: string;
};

export const StakeCooldownModalContent = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const trackEvent = useRootStore((store) => store.trackEvent);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentChainId = useRootStore((store) => store.currentChainId);

  const [cooldownCheck, setCooldownCheck] = useState(false);

  const stakeCooldownSeconds = stakeData?.cooldownSeconds || 0;
  const stakeUnstakeWindow = stakeData?.unstakeWindowSeconds || 0;

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

  const stakedAmount = stakeData?.formattedBalances.stakeTokenRedeemableAmount;

  // error handler
  let blockingError: ErrorType | undefined = undefined;
  if (stakedAmount === '0') {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE;
  }

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>Nothing staked</Trans>;
      default:
        return null;
    }
  };

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success) return <TxSuccessView action={<Trans>Stake cooldown activated</Trans>} />;

  const handleOnCoolDownCheckBox = () => {
    // trackEvent(GENERAL.ACCEPT_RISK, {
    //   asset: stakeAssetName,
    //   modal: 'Cooldown',
    // });
    setCooldownCheck(!cooldownCheck);
  };
  const amountToCooldown = stakeData?.formattedBalances.stakeTokenRedeemableAmount || '0';
  const amountToCooldownUsd = new BigNumber(amountToCooldown)
    .multipliedBy(stakeData.price)
    .shiftedBy(-8);

  const dateMessage = (time: number) => {
    const now = dayjs();

    const futureDate = now.add(time, 'second');

    return futureDate.format('DD.MM.YY');
  };

  const googleDate = (timeInSeconds: number) => {
    const date = dayjs().add(timeInSeconds, 'second');
    return date.format('YYYYMMDDTHHmmss') + 'Z'; // UTC time
  };

  const createGoogleCalendarUrl = (event: CalendarEvent) => {
    const startTime = encodeURIComponent(event.start);
    const endTime = encodeURIComponent(event.end);
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startTime}/${endTime}&details=${details}`;
  };

  const event = {
    title: 'Unstaking window for Aave',
    start: googleDate(stakeCooldownSeconds),
    end: googleDate(stakeCooldownSeconds + stakeUnstakeWindow),
    description: 'Unstaking window for Aave staking activated',
  };

  const googleCalendarUrl = createGoogleCalendarUrl(event);

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  return (
    <>
      <TxModalTitle title="Cooldown to unstake" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={currentNetworkConfig.name} chainId={currentChainId} />
      )}
      <Typography variant="description" sx={{ mb: 6 }}>
        <Trans>
          You&apos;ll need to wait {timeMessage(stakeCooldownSeconds)} before you can unstake your
          tokens. This cooldown starts when you request to unstake. Once it ends, you can withdraw
          during the unstake window.
        </Trans>{' '}
        <Link
          onClick={() =>
            trackEvent(GENERAL.EXTERNAL_LINK, {
              assetName: 'ABPT',
              link: 'Cooldown Learn More',
            })
          }
          variant="description"
          href="https://docs.aave.com/faq/migration-and-staking"
          sx={{ textDecoration: 'underline' }}
        >
          <Trans>Learn more</Trans>
        </Link>
        .
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          pt: '6px',
          pb: '30px',
        }}
      >
        <Typography variant="description" color="text.primary">
          <Trans>Amount available to unstake</Trans>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Stack direction="column" alignItems="flex-end">
            <Stack direction="row" alignItems="center">
              <TokenIcon symbol={stakeData.iconSymbol} sx={{ mr: 1, width: 14, height: 14 }} />
              <FormattedNumber
                value={amountToCooldown}
                variant="secondary14"
                color="text.primary"
              />
            </Stack>
            <FormattedNumber
              value={amountToCooldownUsd.toString()}
              compact
              symbol="USD"
              variant="secondary12"
              color="text.muted"
              symbolsColor="text.muted"
            />
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          pt: '6px',
          pb: '30px',
        }}
      >
        <Typography variant="description" color="text.primary">
          <Trans>Unstake window</Trans>
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="secondary14" component="span">
              {dateMessage(stakeCooldownSeconds)}
            </Typography>
            <SvgIcon sx={{ fontSize: '13px', mx: 1 }}>
              <ArrowNarrowRightIcon />
            </SvgIcon>
            <Typography variant="secondary14" component="span">
              {dateMessage(stakeCooldownSeconds + stakeUnstakeWindow)}
            </Typography>
          </Box>
          <Link
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
          >
            <Trans>Remind me</Trans>
            <SvgIcon sx={{ fontSize: '16px', ml: 1 }}>
              <CalendarIcon />
            </SvgIcon>
          </Link>
        </Box>
      </Box>

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

      <GasStation chainId={currentChainId} gasLimit={parseUnits(gasLimit || '0', 'wei')} />

      <FormControlLabel
        sx={{ mt: 12 }}
        control={
          <Checkbox
            checked={cooldownCheck}
            onClick={handleOnCoolDownCheckBox}
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
        selectedToken={stakeData.tokenAddress}
        amountToCooldown={amountToCooldown}
      />
    </>
  );
};
