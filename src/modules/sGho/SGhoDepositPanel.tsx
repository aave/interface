import { Grid } from '@mui/material';
import { SavingsCardSkeleton } from 'src/components/SavingsCardSkeleton';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { SGhoDepositRow } from './SGhoDepositRow';
import { SGhoLoggedOutPreview } from './SGhoLoggedOutPreview';
import { SGhoWithdrawRow } from './SGhoWithdrawRow';

export interface SGhoDepositPanelProps {
  loading?: boolean;
  walletGhoBalance: string;
  userBalance: string;
  userBalanceUSD: string;
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
  rate,
  onDeposit,
  onWithdraw,
  onGetGho,
}: SGhoDepositPanelProps) => {
  const { currentAccount } = useWeb3Context();

  // Render the logged-out preview before the loading gate — vault data may
  // never resolve when no user is set, so we'd otherwise be stuck on the
  // skeleton forever.
  if (!currentAccount) {
    return <SGhoLoggedOutPreview rate={rate} />;
  }

  if (loading) {
    return <SavingsCardSkeleton hasAccount={!!currentAccount} />;
  }

  return (
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
  );
};
