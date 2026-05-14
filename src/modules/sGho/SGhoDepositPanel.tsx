import { Box, Divider, Grid } from '@mui/material';
import { SavingsCardSkeleton } from 'src/components/SavingsCardSkeleton';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { SGhoDepositRow } from './SGhoDepositRow';
import { SGhoSavingsRate } from './SGhoSavingsRate';
import { SGhoWithdrawRow } from './SGhoWithdrawRow';

export interface SGhoDepositPanelProps {
  loading?: boolean;
  walletGhoBalance: string;
  userBalance: string;
  userBalanceUSD: string;
  totalDepositedUSD: string;
  rate: number;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onGetGho?: () => void;
}

export const SGhoDepositPanel = ({
  loading,
  walletGhoBalance,
  userBalance,
  userBalanceUSD,
  totalDepositedUSD,
  rate,
  onDeposit,
  onWithdraw,
  onGetGho,
}: SGhoDepositPanelProps) => {
  const { currentAccount } = useWeb3Context();

  if (loading) {
    return <SavingsCardSkeleton hasAccount={!!currentAccount} />;
  }

  return (
    <>
      {currentAccount && (
        <>
          <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <SGhoDepositRow
                walletBalance={walletGhoBalance}
                rate={rate}
                onDeposit={onDeposit}
                onGetGho={onGetGho}
              />

              <SGhoWithdrawRow
                balance={userBalance}
                balanceUSD={userBalanceUSD}
                onWithdraw={onWithdraw}
              />
            </Grid>
          </Grid>

          <Divider />
        </>
      )}

      <Box sx={{ mt: currentAccount ? 8 : 0 }}>
        <SGhoSavingsRate totalDepositedUSD={totalDepositedUSD} rate={rate} />
      </Box>
    </>
  );
};
