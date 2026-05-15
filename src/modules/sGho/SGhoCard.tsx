import { AaveV3Ethereum } from '@aave-dao/aave-address-book';
import { Trans } from '@lingui/macro';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { useSGhoVaultContext } from 'src/modules/sGho/SGhoVaultContext';

import { SGhoDepositPanel } from './SGhoDepositPanel';

export const SGhoCard = () => {
  const { marketData, chainId } = useSavingsMarketData();
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));
  const { openSwitch, openSGhoVaultDeposit, openSGhoVaultWithdraw } = useModalContext();
  const { vault, loading: vaultLoading } = useSGhoVaultContext();

  const { walletBalances } = useWalletBalances(marketData);
  const ghoAddress = AaveV3Ethereum.ASSETS.GHO.UNDERLYING.toLowerCase();
  const walletGhoBalance = walletBalances[ghoAddress]?.amount ?? '0';

  const sghoBalance = vault?.user?.balance.amount.value ?? '0';
  const sghoBalanceUSD = vault?.user?.balance.usd ?? '0';
  const totalDepositedUSD = vault?.totalAssets?.usd ?? '0';
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
        totalDepositedUSD={totalDepositedUSD}
        rate={targetRate}
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
        onGetGho={onGetGho}
      />
    </Paper>
  );
};
