import { Trans } from '@lingui/macro';
import { Stack, Typography } from '@mui/material';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';

import { ListValueColumn } from '../dashboard/lists/ListValueColumn';
import { SecondsToString } from '../staking/StakingPanel';

export const AmountStakedItem = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const now = useCurrentTimestamp(1);
  const { stakeTokenBalance, stakeTokenBalanceUSD } = stakeData.formattedBalances;

  const endOfCooldown = stakeData?.cooldownData.endOfCooldown || 0;
  const unstakeWindow = stakeData?.cooldownData.withdrawalWindow || 0;
  const cooldownTimeRemaining = endOfCooldown - now;

  const isCooldownActive = cooldownTimeRemaining > 0;
  const isUnstakeWindowActive = endOfCooldown < now && now < endOfCooldown + unstakeWindow;
  const unstakeTimeRemaining = endOfCooldown + unstakeWindow - now;

  // const availableToReactivateCooldown =
  //   isCooldownActive &&
  //   BigNumber.from(stakeData?.balances.stakeTokenRedeemableAmount || 0).gt(
  //     stakeData?.cooldownData.cooldownAmount || 0
  //   );

  // console.log('TODO: availableToReactivateCooldown', availableToReactivateCooldown);
  return (
    <Stack direction="column" alignItems="center" justifyContent="center">
      <ListValueColumn
        value={stakeTokenBalance}
        subValue={stakeTokenBalanceUSD}
        withTooltip
        disabled={stakeTokenBalance === '0'}
      />
      {isCooldownActive && <Cooldown cooldownTimeRemaining={cooldownTimeRemaining} />}
      {isUnstakeWindowActive && <UnstakeWindow unstakeTimeRemaining={unstakeTimeRemaining} />}
    </Stack>
  );
};

const Cooldown = ({ cooldownTimeRemaining }: { cooldownTimeRemaining: number }) => {
  return (
    <Stack
      gap={1}
      minWidth={'125px'}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Typography variant="helperText">
        <Trans>Remaining cooldown</Trans>
      </Typography>
      <Typography variant="helperText">
        <SecondsToString seconds={cooldownTimeRemaining} />
      </Typography>
    </Stack>
  );
};

const UnstakeWindow = ({ unstakeTimeRemaining }: { unstakeTimeRemaining: number }) => {
  return (
    <Stack
      gap={1}
      minWidth={'125px'}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Typography variant="helperText">
        <Trans>Remaining time to unstake</Trans>
      </Typography>
      <Typography variant="helperText">
        <SecondsToString seconds={unstakeTimeRemaining} />
      </Typography>
    </Stack>
  );
};
