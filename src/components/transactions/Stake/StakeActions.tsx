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
  event: string;
}

export const StakeActions = ({
  amountToStake,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  event,
  ...props
}: StakeActionProps) => {
  const { stake, stakeWithPermit } = useRootStore();

  const { action, approval, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      tryPermit: selectedToken === 'aave',
      permitAction: ProtocolAction.stakeWithPermit,
      protocolAction: ProtocolAction.stake,
      handleGetTxns: async () => {
        return stake({
          token: selectedToken,
          amount: amountToStake.toString(),
        });
      },
      handleGetPermitTxns: async (signature, deadline) => {
        return stakeWithPermit({
          token: selectedToken,
          amount: amountToStake.toString(),
          signature: signature[0],
          deadline,
        });
      },
      eventTxInfo: {
        amount: amountToStake,
        assetName: selectedToken,
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
      handleApproval={() =>
        approval([{ amount: amountToStake, underlyingAsset: selectedToken, permitType: 'STAKE' }])
      }
      symbol={symbol}
      requiresAmount
      actionText={<Trans>Stake</Trans>}
      tryPermit={selectedToken === 'aave'}
      actionInProgressText={<Trans>Staking</Trans>}
      sx={sx}
      // event={STAKE.STAKE_BUTTON_MODAL}
      {...props}
    />
  );
};
