import { Stack } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
// import { BigNumber } from 'ethers';

// import { SecondsToString } from '../staking/StakingPanel';

export const AmountStakedItem = ({ stakeData }: { stakeData: MergedStakeData }) => {
  // const now = useCurrentTimestamp(1);
  const { stakeTokenBalance, stakeTokenBalanceUSD } = stakeData.formattedBalances;

  // const cooldownSeconds = stakeData?.cooldownSeconds || 0;
  // const endOfCooldown = stakeData?.cooldownData.endOfCooldown || 0;
  // const unstakeWindow = stakeData?.cooldownData.withdrawalWindow || 0;
  // const cooldownTimeRemaining = endOfCooldown - now;
  // const unstakeTimeRemaining = endOfCooldown + unstakeWindow - now;

  // const isCooldownActive = cooldownTimeRemaining > 0;
  // const isUnstakeWindowActive = endOfCooldown < now && now < endOfCooldown + unstakeWindow;

  // const availableToReactivateCooldown =
  //   isCooldownActive &&
  //   BigNumber.from(stakeData?.balances.stakeTokenRedeemableAmount || 0).gt(
  //     stakeData?.cooldownData.cooldownAmount || 0
  //   );

  // console.log('TODO: availableToReactivateCooldown', availableToReactivateCooldown);
  return (
    <Stack direction="column" alignItems="center" justifyContent="center">
      <FormattedNumber compact value={stakeTokenBalance} variant="main16" />
      <ReserveSubheader value={stakeTokenBalanceUSD} />
      {/* <Stack direction="column" alignItems="center" justifyContent="center" minWidth={150}>
        <Button fullWidth variant="outlined" size="medium" disabled={stakeTokenBalance === '0'}>
          <Trans>Cooldown</Trans>
        </Button>
        <Stack width={'100%'} direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="helperText">
            <Trans>Cooldown period</Trans>
          </Typography>
          <Typography variant="helperText">
            <SecondsToString seconds={stakeData.cooldownSeconds} />
          </Typography>
        </Stack>
      </Stack> */}
    </Stack>
  );
};
