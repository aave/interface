import { ProtocolAction } from '@aave/contract-helpers';
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
  amountToCooldown: string;
  amountToCooldownUSD: string;
}

export const StakeCooldownActions = ({
  isWrongNetwork,
  sx,
  blocked,
  selectedToken,
  amountToCooldown,
  amountToCooldownUSD,
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
    protocolAction: ProtocolAction.stakeCooldown,
    eventTxInfo: {
      amount: amountToCooldown,
      amountUSD: amountToCooldownUSD,
      assetName: selectedToken,
    },
  });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<Trans>Activate Cooldown</Trans>}
      actionInProgressText={<Trans>Activate Cooldown</Trans>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
    />
  );
};
