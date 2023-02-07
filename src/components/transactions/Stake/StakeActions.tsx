import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useRootStore } from 'src/store/root';

import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface StakeActionProps extends BoxProps {
  amountToStake: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  selectedToken: string;
}

export const StakeActions = ({
  amountToStake,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  ...props
}: StakeActionProps) => {
  const { stake, stakeWithPermit } = useRootStore();

  const { action, approval, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      tryPermit: selectedToken === 'aave',
      permitAction: ProtocolAction.stakeWithPermit,
      handleGetTxns: async () => {
        return stake({
          token: selectedToken,
          amount: amountToStake.toString(),
        });
      },
      handleGetPermitTxns: async (signature) => {
        return stakeWithPermit({
          token: selectedToken,
          amount: amountToStake.toString(),
          signature: signature[0],
        });
      },
      skip: !amountToStake || parseFloat(amountToStake) === 0 || blocked,
      deps: [amountToStake, selectedToken],
    });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      amount={amountToStake}
      handleAction={action}
      handleApproval={() => approval([{ amount: amountToStake, underlyingAsset: selectedToken, permitType: 'STAKE' }])}
      symbol={symbol}
      requiresAmount
      actionText={<Trans>Stake</Trans>}
      tryPermit={selectedToken === 'aave'}
      actionInProgressText={<Trans>Staking</Trans>}
      sx={sx}
      {...props}
    />
  );
};
