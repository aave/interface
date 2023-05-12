import { Trans } from '@lingui/macro';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';

interface ManageStakeActionsProps {
  symbol: string;
  amount: string;
  isWrongNetwork: boolean;
  requiresApproval: boolean;
  handleApproval: () => void;
}

export const ManageStakeActions = ({
  symbol,
  amount,
  isWrongNetwork,
  requiresApproval,
  handleApproval,
}: ManageStakeActionsProps) => {
  return (
    <TxActionsWrapper
      symbol={symbol}
      requiresAmount
      amount={amount}
      actionText={<Trans>Stake {symbol}</Trans>}
      actionInProgressText={<Trans>Staking {symbol}</Trans>}
      isWrongNetwork={isWrongNetwork}
      requiresApproval={requiresApproval}
      handleApproval={handleApproval}
    />
  );
};
