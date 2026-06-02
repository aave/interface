import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';

import { StakeActionBox } from '../staking/StakeActionBox';

interface SGhoWithdrawRowProps {
  balance: string;
  balanceUSD: string;
  onWithdraw?: () => void;
}

export const SGhoWithdrawRow = ({ balance, balanceUSD, onWithdraw }: SGhoWithdrawRowProps) => {
  const hasBalance = Number(balance) > 0;

  return (
    <Box>
      <StakeActionBox
        title={<Trans>sGHO</Trans>}
        value={balance}
        valueUSD={balanceUSD}
        dataCy="sghoBalanceBox"
        bottomLineTitle={
          <Typography variant="caption" color="text.secondary">
            <Trans>Cooldown period</Trans>
          </Typography>
        }
        bottomLineComponent={
          <Typography variant="secondary12">
            <Trans>Instant</Trans>
          </Typography>
        }
      >
        <Button
          variant="outlined"
          fullWidth
          onClick={onWithdraw}
          disabled={!hasBalance}
          data-cy="withdrawBtn_SGHO"
        >
          <Trans>Withdraw</Trans>
        </Button>
      </StakeActionBox>
    </Box>
  );
};
