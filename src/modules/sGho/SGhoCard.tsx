import { ChainId } from '@aave/contract-helpers';
import { chainId, evmAddress, useSghoVault } from '@aave/react';
import { AaveV3Ethereum } from '@aave-dao/aave-address-book';
import { Trans } from '@lingui/macro';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ZERO_ADDRESS } from 'src/modules/governance/utils/formatProposal';
import { useRootStore } from 'src/store/root';

import { SGhoDepositPanel } from './SGhoDepositPanel';

export const SGhoCard = () => {
  const { currentAccount } = useWeb3Context();
  const currentMarketData = useRootStore((s) => s.currentMarketData);
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));
  const { openSwitch } = useModalContext();

  const userAddress = currentAccount ? evmAddress(currentAccount) : evmAddress(ZERO_ADDRESS);
  const requestChainId = chainId(currentMarketData.chainId);

  const { data: vault, loading: vaultLoading } = useSghoVault({
    user: userAddress,
    chainId: requestChainId,
  });

  const { walletBalances } = useWalletBalances(currentMarketData);
  const ghoAddress = AaveV3Ethereum.ASSETS.GHO.UNDERLYING.toLowerCase();
  const walletGhoBalance = walletBalances[ghoAddress]?.amount ?? '0';

  const sghoBalance = vault?.user?.balance.amount.value ?? '0';
  const sghoBalanceUSD = vault?.user?.balance.usd ?? '0';
  const totalDepositedUSD = vault?.totalAssets?.usd ?? '0';
  const targetRate = vault?.targetRate ? +vault.targetRate.value : 0;

  // TODO: wire to new sGHO deposit/withdraw modals when implemented
  const onDeposit = () => {
    /* TODO: open new sGHO deposit modal */
  };
  const onWithdraw = () => {
    /* TODO: open new sGHO withdraw modal */
  };
  const onGetGho = () => {
    openSwitch('', ChainId.mainnet);
  };

  return (
    <Paper
      sx={{
        pt: 4,
        pb: { xs: 6, md: 20 },
        px: downToXsm ? 4 : 6,
        flex: 1,
        width: { xs: '100%', md: 'auto' },
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
