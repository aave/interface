import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useRootStore } from 'src/store/root';
// import { useRootStore } from 'src/store/root';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface StakeCooldownActionsProps extends BoxProps {
  isWrongNetwork: boolean;
  customGasPrice?: string;
  blocked: boolean;
  selectedToken: string;
  amountToCooldown: string;
}

export const StakeCooldownActions = ({
  isWrongNetwork,
  sx,
  blocked,
  selectedToken,
  amountToCooldown,
  ...props
}: StakeCooldownActionsProps) => {
  const { uiStakeDataService } = useSharedDependencies();

  const [currentMarketData, user] = useRootStore((state) => [
    state.currentMarketData,
    state.account,
  ]);

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return uiStakeDataService.cooldown(selectedToken, currentMarketData, user);
    },
    skip: blocked,
    deps: [],
    protocolAction: ProtocolAction.stakeCooldown,
    eventTxInfo: {
      amount: amountToCooldown,
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
