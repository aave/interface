import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useRootStore } from 'src/store/root';

import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface StakeRewardClaimRestakeActionProps extends BoxProps {
  amountToClaim: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  selectedToken: string;
}

export const StakeRewardClaimRestakeActions = ({
  amountToClaim,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  ...props
}: StakeRewardClaimRestakeActionProps) => {
  const claimStakeRewards = useRootStore((state) => state.claimStakeRewards);

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return claimStakeRewards({
        token: selectedToken,
        amount: amountToClaim,
      });
    },
    skip: blocked,
    deps: [],
  });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<Trans>CLAIM {symbol}</Trans>}
      actionInProgressText={<Trans>CLAIMING {symbol}</Trans>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
    />
  );
};
