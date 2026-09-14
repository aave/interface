import { Trans } from '@lingui/macro';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Box, keyframes, Stack, Typography } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import { ReactElement } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { SecondsToString } from 'src/components/SecondsToString';
import { timeMessage } from 'src/helpers/timeHelper';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';

import { ListValueColumn } from '../dashboard/lists/ListValueColumn';

// Static, and hoisted because `useCurrentTimestamp` re-renders this component once a second for
// every row on the page.
// Baseline, not centre: the USD value is `description` (20px leading) beside an `h5`
// (18px), and `ReserveSubheader` carries a 2px top margin for the stacked layout it was
// written for. Aligning baselines makes both irrelevant.
const INLINE_SHARES_SX = { display: 'flex', alignItems: 'baseline', gap: 2 };

export const AmountSharesItem = ({
  stakeData,
  inline,
}: {
  stakeData: MergedStakeData;
  /** Lay the amount and its USD equivalent on one line instead of stacking them. */
  inline?: boolean;
}) => {
  const now = useCurrentTimestamp(1);
  const { stakeTokenBalance, stakeTokenBalanceUSD } = stakeData.formattedBalances;

  const endOfCooldown = stakeData?.cooldownData.endOfCooldown || 0;
  const unstakeWindow = stakeData?.cooldownData.withdrawalWindow || 0;
  const cooldownAmount = formatUnits(
    stakeData?.cooldownData.cooldownAmount || '0',
    stakeData.decimals
  );
  const cooldownTimeRemaining = endOfCooldown - now;

  const isCooldownActive = cooldownTimeRemaining > 0;
  const isUnstakeWindowActive = endOfCooldown < now && now < endOfCooldown + unstakeWindow;
  const unstakeTimeRemaining = endOfCooldown + unstakeWindow - now;

  const shares = (
    <>
      <FormattedNumber compact value={stakeTokenBalance} variant="h5" />
      <ReserveSubheader value={stakeTokenBalanceUSD} />
    </>
  );

  return (
    <Stack direction="column" alignItems="flex-end" justifyContent="center">
      {!isCooldownActive && !isUnstakeWindowActive ? (
        // Inline on the mobile card, where a row has the width for one line. The desktop column
        // stays stacked — which the enclosing Stack already does, so it needs no wrapper at all.
        inline ? (
          <Box sx={INLINE_SHARES_SX}>{shares}</Box>
        ) : (
          shares
        )
      ) : (
        <ListValueColumn
          value={stakeTokenBalance}
          subValue={stakeTokenBalanceUSD}
          withTooltip
          disabled={stakeTokenBalance === '0'}
        />
      )}
      {isCooldownActive && (
        <Countdown
          timeRemaining={cooldownTimeRemaining}
          tooltipContent={
            <CooldownTooltip cooldownAmount={cooldownAmount} unstakeWindow={unstakeWindow} />
          }
        />
      )}
      {isUnstakeWindowActive && (
        <Countdown
          animate
          timeRemaining={unstakeTimeRemaining}
          tooltipContent={<UnstakeTooltip cooldownAmount={cooldownAmount} />}
        />
      )}
    </Stack>
  );
};

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
  100% {
    opacity: 1;
  }
`;

const Countdown = ({
  timeRemaining,
  tooltipContent,
  animate,
}: {
  timeRemaining: number;
  tooltipContent: ReactElement;
  animate?: boolean;
}) => {
  return (
    <ContentWithTooltip tooltipContent={tooltipContent}>
      <Stack
        gap={1}
        direction="row"
        alignItems="center"
        sx={{ animation: animate ? `${pulse} 1.5s infinite` : 'none' }}
      >
        <AccessTimeIcon fontSize="small" />
        <Typography variant="helperText">
          <SecondsToString seconds={timeRemaining} />
        </Typography>
      </Stack>
    </ContentWithTooltip>
  );
};

const CooldownTooltip = ({
  cooldownAmount,
  unstakeWindow,
}: {
  cooldownAmount: string;
  unstakeWindow: number;
}) => {
  return (
    <Stack gap={2} direction="column">
      <Trans>
        After the cooldown period ends, you will enter the unstake window of{' '}
        {timeMessage(unstakeWindow)}. You will continue receiving rewards during cooldown and the
        unstake period.
      </Trans>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Trans>Amount in cooldown</Trans>
        <FormattedNumber variant="caption" value={cooldownAmount} />
      </Stack>
    </Stack>
  );
};

const UnstakeTooltip = ({ cooldownAmount }: { cooldownAmount: string }) => {
  return (
    <Stack gap={2} direction="column">
      <Trans>Time remaining until the withdraw period ends.</Trans>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Trans>Available to withdraw</Trans>
        <FormattedNumber variant="caption" value={cooldownAmount} />
      </Stack>
    </Stack>
  );
};
