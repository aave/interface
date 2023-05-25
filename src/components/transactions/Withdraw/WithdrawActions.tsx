import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { updatePythPriceTx } from 'src/helpers/pythHelpers';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface WithdrawActionsProps extends BoxProps {
  poolReserve: ComputedReserveData;
  amountToWithdraw: string;
  poolAddress: string;
  isWrongNetwork: boolean;
  symbol: string;
  blocked: boolean;
  updateData: string[];
}

export const WithdrawActions = ({
  poolReserve,
  amountToWithdraw,
  poolAddress,
  isWrongNetwork,
  symbol,
  blocked,
  updateData,
  sx,
}: WithdrawActionsProps) => {
  const withdraw = useRootStore((state) => state.withdraw);

  const { action, loadingTxns, mainTxState, approvalTxState, approval, requiresApproval } =
    useTransactionHandler({
      tryPermit: false,
      handleGetTxns: async () =>
        withdraw({
          reserve: poolAddress,
          amount: amountToWithdraw,
          aTokenAddress: poolReserve.aTokenAddress,
        }),
      skip: !amountToWithdraw || parseFloat(amountToWithdraw) === 0 || blocked,
      deps: [amountToWithdraw, poolAddress],
    });

  const sequentialtxs = () => updatePythPriceTx(updateData).then(action);

  return (
    <TxActionsWrapper
      blocked={blocked}
      preparingTransactions={loadingTxns}
      approvalTxState={approvalTxState}
      mainTxState={mainTxState}
      amount={amountToWithdraw}
      isWrongNetwork={isWrongNetwork}
      requiresAmount
      actionInProgressText={<Trans>Withdrawing {symbol}</Trans>}
      actionText={<Trans>Update Price & Withdraw {symbol}</Trans>}
      handleAction={sequentialtxs}
      handleApproval={() => approval(amountToWithdraw, poolAddress)}
      requiresApproval={requiresApproval}
      sx={sx}
    />
  );
};
