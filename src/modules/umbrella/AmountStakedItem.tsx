import { Trans } from '@lingui/macro';
import { Button, Stack, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { SecondsToString } from '../staking/StakingPanel';

export const AmountStakedItem = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const { stakeTokenBalance, stakeTokenBalanceUSD } = stakeData.formattedBalances;

  return (
    <Stack direction="column" alignItems="center" justifyContent="center">
      <FormattedNumber compact value={stakeTokenBalance} variant="main16" />
      <ReserveSubheader value={stakeTokenBalanceUSD} />
      <Stack direction="column" alignItems="center" justifyContent="center" minWidth={150}>
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
      </Stack>
    </Stack>
  );
};
