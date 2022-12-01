import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useParaSwapTransactionHandler } from 'src/helpers/useParaSwapTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { SwapTransactionParams } from 'src/hooks/paraswap/common';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

interface SwapBaseProps extends BoxProps {
  amountToSwap: string;
  amountToReceive: string;
  poolReserve: ComputedReserveData;
  targetReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  isMaxSelected: boolean;
  useFlashLoan: boolean;
  loading?: boolean;
}

export interface SwapActionProps extends SwapBaseProps {
  swapCallData: string;
  augustus: string;
}

export const SwapActions = ({
  amountToSwap,
  isWrongNetwork,
  sx,
  poolReserve,
  targetReserve,
  isMaxSelected,
  useFlashLoan,
  loading,
  symbol,
  blocked,
  buildTxFn,
  ...props
}: SwapBaseProps & { buildTxFn: () => Promise<SwapTransactionParams> }) => {
  const swapCollateral = useRootStore((state) => state.swapCollateral);

  const { approval, action, requiresApproval, approvalTxState, mainTxState, loadingTxns } =
    useParaSwapTransactionHandler({
      handleGetTxns: async () => {
        const route = await buildTxFn();
        return swapCollateral({
          amountToSwap: route.inputAmount,
          amountToReceive: route.outputAmount,
          poolReserve,
          targetReserve,
          isWrongNetwork,
          symbol,
          blocked,
          isMaxSelected,
          useFlashLoan,
          swapCallData: route.swapCallData,
          augustus: route.augustus,
        });
      },
      skip: loading || !amountToSwap || parseFloat(amountToSwap) === 0,
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
      handleApproval={() => approval()}
      requiresApproval={requiresApproval}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      sx={sx}
      fetchingData={loading}
      errorParams={{
        loading: false,
        disabled: false,
        content: <Trans>Swap</Trans>,
        handleClick: action,
      }}
      {...props}
    />
  );
};
