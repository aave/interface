import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { OptimalRate } from 'paraswap-core';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface SwapActionProps extends BoxProps {
  amountToSwap: string;
  amountToReceive: string;
  poolReserve: ComputedReserveData;
  targetReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  priceRoute: OptimalRate | null;
  isMaxSelected: boolean;
  useFlashLoan: boolean;
}

export const SwapActions = ({
  amountToSwap,
  amountToReceive,
  isWrongNetwork,
  sx,
  poolReserve,
  targetReserve,
  priceRoute,
  isMaxSelected,
  useFlashLoan,
  symbol,
  blocked,
  ...props
}: SwapActionProps) => {
  const swapCollateral = useRootStore((state) => state.swapCollateral);

  const { approval, action, requiresApproval, approvalTxState, mainTxState, loadingTxns } =
    useTransactionHandler({
      handleGetTxns: async () => {
        return swapCollateral({
          amountToSwap,
          amountToReceive,
          poolReserve,
          targetReserve,
          isWrongNetwork,
          symbol,
          blocked,
          priceRoute,
          isMaxSelected,
          useFlashLoan,
        });
      },
      skip: !priceRoute || !amountToSwap || parseFloat(amountToSwap) === 0,
      deps: [
        amountToSwap,
        amountToReceive,
        priceRoute,
        poolReserve.underlyingAsset,
        targetReserve.underlyingAsset,
        isMaxSelected,
        useFlashLoan,
      ],
    });

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={amountToSwap}
      handleApproval={() =>
        approval({ amount: amountToSwap, underlyingAsset: poolReserve.aTokenAddress })
      }
      requiresApproval={requiresApproval}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      sx={sx}
      {...props}
    />
  );
};
