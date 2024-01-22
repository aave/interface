import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useRootStore } from 'src/store/root';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface StakeRewardClaimActionProps extends BoxProps {
  amountToClaim: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  selectedToken: string;
}

export const StakeRewardClaimActions = ({
  amountToClaim,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  ...props
}: StakeRewardClaimActionProps) => {
  const { uiStakeDataService } = useSharedDependencies();
  const [currentMarketData, user] = useRootStore((state) => [
    state.currentMarketData,
    state.account,
  ]);

  // const claimStakeRewards = useRootStore((state) => state.claimStakeRewards);

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return uiStakeDataService.claimStakeRewards({
        token: selectedToken,
        amount: amountToClaim,
        marketData: currentMarketData,
        user,
      });
    },
    skip: !amountToClaim || parseFloat(amountToClaim) === 0 || blocked,
    deps: [amountToClaim],
  });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<Trans>Claim {symbol}</Trans>}
      actionInProgressText={<Trans>Claiming {symbol}</Trans>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
    />
  );
};
