import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useRootStore } from 'src/store/root';

import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface StakeCooldownActionsProps extends BoxProps {
  isWrongNetwork: boolean;
  customGasPrice?: string;
  blocked: boolean;
  selectedToken: string;
}

export const StakeCooldownActions = ({
  isWrongNetwork,
  sx,
  blocked,
  selectedToken,
  ...props
}: StakeCooldownActionsProps) => {
  const cooldown = useRootStore((state) => state.cooldown);

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return cooldown(selectedToken);
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
      actionText={<Trans>ACTIVATE COOLDOWN</Trans>}
      actionInProgressText={<Trans>ACTIVATE COOLDOWN</Trans>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
    />
  );
};
