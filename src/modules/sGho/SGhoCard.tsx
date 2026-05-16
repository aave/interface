import { Trans } from '@lingui/macro';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useModalContext } from 'src/hooks/useModal';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { useSGhoVaultContext } from 'src/modules/sGho/SGhoVaultContext';

import { SGhoDepositPanel } from './SGhoDepositPanel';

export const SGhoCard = () => {
  const { chainId } = useSavingsMarketData();
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));
  const { openSwitch, openSGhoVaultDeposit, openSGhoVaultWithdraw } = useModalContext();
  const { vault, loading: vaultLoading } = useSGhoVaultContext();

  const walletGhoBalance = vault?.user?.underlyingBalance.amount.value.toString() ?? '0';

  // Show the raw sGHO share count (not the underlying GHO-equivalent balance) —
  // the "sGHO" StakeActionBox should reflect the token the user actually holds.
  const sghoBalance = vault?.user?.shares.amount.value ?? '0';
  const sghoBalanceUSD = vault?.user?.shares.usd ?? '0';
  const targetRate = vault?.targetRate ? +vault.targetRate.value : 0;

  const onDeposit = () => {
    openSGhoVaultDeposit();
  };
  const onWithdraw = () => {
    openSGhoVaultWithdraw();
  };
  const onGetGho = () => {
    openSwitch('', chainId);
  };

  return (
    <Paper
      sx={{
        pt: 4,
        pb: { xs: 6, md: 20 },
        px: downToXsm ? 4 : 6,
        flex: 1,
        minWidth: 0,
        width: { xs: '100%', mdlg: 'auto' },
      }}
    >
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography variant="h3">
          <Trans>Savings GHO (sGHO)</Trans>
        </Typography>
      </Box>

      <SGhoDepositPanel
        loading={vaultLoading || !vault}
        walletGhoBalance={walletGhoBalance}
        userBalance={sghoBalance}
        userBalanceUSD={sghoBalanceUSD}
        rate={targetRate}
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
        onGetGho={onGetGho}
      />
    </Paper>
  );
};
