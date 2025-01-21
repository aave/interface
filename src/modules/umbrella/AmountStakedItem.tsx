import { Trans } from '@lingui/macro';
import { Button, Stack } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';

export const AmountStakedItem = ({ stakeData }: { stakeData: MergedStakeData }) => {
  // TODO: need to add the stake token USD value to data provider
  const stakeTokenBalance = stakeData.formattedBalances.stakeTokenBalance;
  return (
    <Stack direction="column" alignItems="center" justifyContent="center">
      <FormattedNumber compact value={stakeTokenBalance} variant="main16" />
      <ReserveSubheader value={stakeTokenBalance} />
      {stakeTokenBalance !== '0' && (
        <Button variant="outlined" size="medium">
          <Trans>Cooldown</Trans>
        </Button>
      )}
    </Stack>
  );
};
