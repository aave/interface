import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface RepayActionProps extends BoxProps {
  amountToRepay: string;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  debtType: InterestRate;
  repayWithATokens: boolean;
  blocked?: boolean;
}

export const RepayActions = ({
  amountToRepay,
  poolReserve,
  poolAddress,
  isWrongNetwork,
  sx,
  symbol,
  debtType,
  repayWithATokens,
  blocked,
  ...props
}: RepayActionProps) => {
  const [repay, repayWithPermit, tryPermit] = useRootStore((state) => [
    state.repay,
    state.repayWithPermit,
    state.tryPermit,
  ]);

  const usingPermit = tryPermit(poolAddress);
  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      tryPermit: usingPermit,
      handleGetTxns: async () => {
        return repay({
          amountToRepay,
          poolAddress,
          repayWithATokens,
          debtType,
          poolReserve,
          isWrongNetwork,
          symbol,
        });
      },
      handleGetPermitTxns: async (signature, deadline) => {
        return repayWithPermit({
          amountToRepay,
          poolReserve,
          isWrongNetwork,
          poolAddress,
          symbol,
          debtType,
          repayWithATokens,
          signature,
          deadline,
        });
      },
      skip: !amountToRepay || parseFloat(amountToRepay) === 0 || blocked,
      deps: [amountToRepay, poolAddress, repayWithATokens],
    });

  return (
    <TxActionsWrapper
      blocked={blocked}
      preparingTransactions={loadingTxns}
      symbol={poolReserve.symbol}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={amountToRepay}
      requiresApproval={requiresApproval}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
      handleAction={action}
      handleApproval={(forceApproval) =>
        approval({
          amount: amountToRepay,
          underlyingAsset: poolAddress,
          forceApprovalTx: forceApproval,
        })
      }
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
      tryPermit={usingPermit}
    />
  );
};
